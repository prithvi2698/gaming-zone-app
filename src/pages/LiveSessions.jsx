import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';

const formatTimeDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const LiveSessions = () => {
    const { liveSessions, setLiveSessions, setHistory, getRate, foodItems, showToast } = useAppContext();
    const [modal, setModal] = useState({ type: null, sessionId: null, data: {} });

    const openModal = (type, sessionId, data = {}) => { playSound('click'); setModal({ type, sessionId, data }); }
    const closeModal = () => { playSound('click'); setModal({ type: null, sessionId: null, data: {} }); }

    const updateSupa = async (id, changes) => {
        if (!supabase) return;
        try { Object.keys(changes).length > 0 && await supabase.from('sessions').update(changes).eq('id', id); } catch { /* ignore */ }
    };

    const handleQuickAdj = (id, direction) => {
        playSound('click');
        let newSeconds = 0;
        setLiveSessions(prev => prev.map(s => {
            if (s.id !== id || s.isOpen) return s;
            newSeconds = s.bookedSeconds + (direction * 5 * 60);
            return { ...s, bookedSeconds: newSeconds };
        }));
        if (newSeconds) updateSupa(id, { bookedSeconds: newSeconds });
        showToast(`Adjusted session by ${direction > 0 ? '+5m' : '-5m'}`, false);
    };

    const handleExtend = () => {
        const min = parseInt(modal.data.extendMins || 60, 10);
        let newDur = 0, newSec = 0, newRate = 0, label = '';

        setLiveSessions(prev => prev.map(s => {
            if (s.id !== modal.sessionId) return s;
            newDur = (s.duration || 0) + min;
            label = newDur % 60 === 0 ? `${newDur / 60} Hr` : `${newDur} Min`;
            newSec = s.bookedSeconds + (min * 60);
            newRate = getRate(s.station, newDur, s.players);
            return {
                ...s, duration: newDur, durationLabel: label, bookedSeconds: newSec, rate: newRate
            };
        }));

        updateSupa(modal.sessionId, { duration: newDur, durationLabel: label, bookedSeconds: newSec, rate: newRate });
        playSound('success');
        showToast(`Session extended by ${min} mins`, false);
        closeModal();
    };

    const handleAddFood = (item) => {
        playSound('success');
        let updatedOrders = [];
        setLiveSessions(prev => prev.map(s => {
            if (s.id !== modal.sessionId) return s;
            updatedOrders = [{ id: item.id, name: item.name, emoji: item.emoji, price: item.price, addedAt: new Date().toISOString() }, ...s.foodOrders];
            return { ...s, foodOrders: updatedOrders };
        }));
        updateSupa(modal.sessionId, { foodOrders: updatedOrders });
        showToast(`${item.name} added to session`, false);
    };

    const handleRemoveFood = (idx) => {
        playSound('click');
        let updatedOrders = [];
        setLiveSessions(prev => prev.map(s => {
            if (s.id !== modal.sessionId) return s;
            updatedOrders = [...s.foodOrders];
            updatedOrders.splice(idx, 1);
            return { ...s, foodOrders: updatedOrders };
        }));
        updateSupa(modal.sessionId, { foodOrders: updatedOrders });
    };

    const handleEndSession = async () => {
        const session = liveSessions.find(s => s.id === modal.sessionId);
        if (!session) return;

        const baseRate = session.isOpen ? Math.round(getRate(session.station, 60, session.players) * (session.elapsedSeconds / 3600)) : session.rate;
        const foodTotal = (session.foodOrders || []).reduce((sum, f) => sum + f.price, 0);
        const total = baseRate + foodTotal;
        const due = Math.max(0, total - (session.prepayment || 0));

        const endedSession = {
            ...session,
            status: 'ended',
            ended_at: new Date().toISOString(),
            finalBaseRate: baseRate,
            finalFoodTotal: foodTotal,
            finalTotal: total,
            finalDue: due,
            finalPaymentMode: modal.data.payMode || 'Cash',
            finalAmountPaid: parseFloat(modal.data.payAmount || due)
        };

        playSound('success');
        setHistory(prev => [endedSession, ...prev]);
        setLiveSessions(prev => prev.filter(s => s.id !== session.id));
        showToast(`Session Ended. Collected ₹${endedSession.finalAmountPaid}`, false);
        closeModal();

        // Supabase sync: delete active session and insert history
        if (supabase) {
            try {
                await supabase.from('sessions').delete().eq('id', session.id);
                await supabase.from('history').insert([endedSession]);
            } catch { console.warn("Faced issue writing history to cloud"); }
        }
    };

    return (
        <div className="page active" id="page-live" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header">
                <h2>LIVE SESSIONS</h2>
                {liveSessions.length > 0 && <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', color: 'var(--neon2)', background: 'rgba(255,0,110,.1)', border: '1px solid rgba(255,0,110,.3)', borderRadius: '8px', padding: '3px 10px' }}>{liveSessions.length} LIVE</span>}
            </div>

            <div className="live-grid">
                {liveSessions.length === 0 ? (
                    <div className="empty-state">
                        <div className="es-icon">🎮</div>
                        <div className="es-title">NO ACTIVE SESSIONS</div>
                        <div className="es-sub">Tap New Session to start</div>
                    </div>
                ) : (
                    liveSessions.map(s => {
                        const elapsed = s.elapsedSeconds || 0;
                        const remaining = s.isOpen ? null : (s.bookedSeconds - elapsed);
                        const isOver = remaining !== null && remaining <= 0;
                        const isWarn = remaining !== null && remaining <= 300 && remaining > 0;
                        const timerStr = formatTimeDuration(s.isOpen ? elapsed : Math.abs(remaining || 0));
                        const timerColor = isOver ? 'var(--neon2)' : isWarn ? 'var(--warning)' : 'var(--neon)';
                        const timerLabel = isOver ? 'OVERTIME' : s.isOpen ? 'ELAPSED' : 'REMAINING';

                        const foodTotal = (s.foodOrders || []).reduce((sum, f) => sum + f.price, 0);
                        const baseRate = s.isOpen ? Math.round(getRate(s.station, 60, s.players) * (elapsed / 3600)) : s.rate;
                        const total = baseRate + foodTotal;
                        const due = Math.max(0, total - (s.prepayment || 0));

                        const cardBorder = isOver ? 'rgba(255,0,110,.35)' : isWarn ? 'rgba(255,149,0,.35)' : 'var(--border)';
                        const cardBg = isOver ? 'rgba(255,0,110,.04)' : isWarn ? 'rgba(255,149,0,.04)' : 'var(--surface)';

                        return (
                            <div key={s.id} className="session-card" style={{ background: cardBg, borderColor: cardBorder }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${timerColor},transparent)` }}></div>

                                <div className="sc-header">
                                    <div>
                                        <div className="sc-name">{s.name}</div>
                                        <div className="sc-timer" style={{ color: timerColor, ...(isOver ? { animation: 'pulse .8s infinite' } : {}) }}>{timerStr}</div>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: timerColor, opacity: '.7', marginTop: '-4px', letterSpacing: '.5px' }}>{timerLabel}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="sc-station" style={{ background: s.station.startsWith('PS5') ? 'rgba(0,245,255,.1)' : 'rgba(168,85,247,.1)', borderColor: s.station.startsWith('PS5') ? 'rgba(0,245,255,.2)' : 'rgba(168,85,247,.2)', color: s.station.startsWith('PS5') ? 'var(--neon)' : 'var(--neon3)' }}>
                                            {s.stationIcon} {s.station}
                                        </div>
                                    </div>
                                </div>

                                <div className="sc-meta">
                                    <div className="sc-tag">{s.players}P</div>
                                    <div className="sc-tag">{s.durationLabel}</div>
                                    <div className="sc-tag" style={{ border: '1px solid rgba(0,245,255,.3)', color: 'var(--neon)' }}>Due: ₹{due}</div>
                                    {s.prepayment > 0 && <div className="sc-tag" style={{ color: 'var(--muted)' }}>ADV: ₹{s.prepayment} ({s.payment})</div>}
                                </div>

                                <div className="sc-actions">
                                    <button className="sc-btn food" onClick={() => openModal('food', s.id)}>🍔 FOOD</button>
                                    {!s.isOpen && <button className="sc-btn extend" onClick={() => openModal('extend', s.id)}>⏱️ EXTEND</button>}
                                    <button className="sc-btn end" onClick={() => openModal('end', s.id, { due, baseRate, foodTotal, total })}>⏹️ PAY & END</button>
                                </div>

                                {!s.isOpen && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                                        <button className="sc-btn adj" onClick={() => handleQuickAdj(s.id, -1)}>-5m</button>
                                        <button className="sc-btn adj" onClick={() => handleQuickAdj(s.id, 1)}>+5m</button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODALS */}
            {modal.type === 'food' && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease' }}>
                        <div className="modal-close" onClick={closeModal}>✕</div>
                        <div className="modal-title" style={{ color: 'var(--warning)' }}>🍔 ADD FOOD/DRINK</div>

                        <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '14px' }}>
                            {liveSessions.find(s => s.id === modal.sessionId)?.foodOrders?.map((f, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '12px', marginBottom: '6px' }}>
                                    <span>{f.emoji} {f.name} (₹{f.price})</span>
                                    <span style={{ color: 'var(--neon2)', cursor: 'pointer', fontFamily: "'Orbitron', monospace", fontSize: '12px' }} onClick={() => handleRemoveFood(i)}>✕</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {foodItems.map(item => (
                                <div key={item.id} className="food-btn" onClick={() => handleAddFood(item)}>
                                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.emoji}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '700' }}>{item.name}</div>
                                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: 'var(--warning)', marginTop: '2px' }}>₹{item.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modal.type === 'extend' && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease' }}>
                        <div className="modal-close" onClick={closeModal}>✕</div>
                        <div className="modal-title" style={{ color: 'var(--neon3)' }}>⏱️ EXTEND TIME</div>

                        <div className="form-group">
                            <label className="form-label">ADD MINUTES</label>
                            <select className="form-input form-select" value={modal.data.extendMins || '60'} onChange={e => { playSound('click'); setModal(prev => ({ ...prev, data: { ...prev.data, extendMins: e.target.value } })); }}>
                                <option value="30">+ 30 Minutes</option>
                                <option value="60">+ 1 Hour</option>
                                <option value="90">+ 1.5 Hours</option>
                                <option value="120">+ 2 Hours</option>
                            </select>
                        </div>

                        <button className="btn-primary" style={{ background: 'linear-gradient(135deg,rgba(168,85,247,1),rgba(0,245,255,1))' }} onClick={handleExtend} onMouseDown={() => playSound('click')}>CONFIRM EXTENSION</button>
                    </div>
                </div>
            )}

            {modal.type === 'end' && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease' }}>
                        <div className="modal-close" onClick={closeModal}>✕</div>
                        <div className="modal-title" style={{ color: 'var(--success)' }}>✅ END & PAY</div>

                        <div style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: 'var(--muted)' }}>Base Session</span>
                                <span>₹{modal.data.baseRate}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: 'var(--muted)' }}>Food Items</span>
                                <span>₹{modal.data.foodTotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '15px', fontWeight: '800' }}>
                                <span>Total Amount</span>
                                <span style={{ color: 'var(--text)' }}>₹{modal.data.total}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '11px', color: 'var(--muted)' }}>FINAL DUE</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '28px', fontWeight: '900', color: 'var(--neon)' }}>₹{modal.data.due}</div>
                        </div>

                        {modal.data.due > 0 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">PAYMENT MODE</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
                                        {['Cash', 'UPI', 'Card'].map(m => {
                                            const isAct = (modal.data.payMode || 'Cash') === m;
                                            return (
                                                <div key={m} onClick={() => { playSound('click'); setModal(prev => ({ ...prev, data: { ...prev.data, payMode: m } })); }} style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: `1px solid ${isAct ? 'var(--neon)' : 'var(--border)'}`, background: isAct ? 'rgba(0,245,255,.1)' : 'var(--surface2)' }}>
                                                    <div style={{ fontSize: '16px' }}>{m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : '💳'}</div>
                                                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '800', color: isAct ? 'var(--neon)' : 'var(--muted)', marginTop: '2px' }}>{m.toUpperCase()}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ENTER RECEIVED AMOUNT</label>
                                    <input className="form-input" type="number" value={modal.data.payAmount === undefined ? modal.data.due : modal.data.payAmount} onChange={e => { playSound('click'); setModal(prev => ({ ...prev, data: { ...prev.data, payAmount: e.target.value } })); }} style={{ fontSize: '18px', fontFamily: "'Orbitron', monospace", fontWeight: '700', color: 'var(--success)' }} />
                                </div>
                            </>
                        )}

                        <button className="btn-primary" style={{ background: 'linear-gradient(135deg,rgba(0,255,136,.8),rgba(0,245,255,.8))' }} onClick={handleEndSession}>✅ COMPLETE SESSION</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveSessions;
