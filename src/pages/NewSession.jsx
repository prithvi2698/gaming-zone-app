import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';

const NewSession = () => {
    const navigate = useNavigate();
    const { ps5Stations, pcStations, liveSessions, setLiveSessions, getRate, showToast } = useAppContext();

    const [form, setForm] = useState({
        name: '', phone: '', station: '', players: '1', duration: '60', paymentMode: 'Cash', notes: ''
    });

    const [splits, setSplits] = useState({ cash: 0, upi: 0, card: 0 });

    let rate = 0;
    if (form.station && form.duration !== '0') {
        rate = getRate(form.station, parseInt(form.duration, 10), parseInt(form.players, 10));
    }

    const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const activeStationNames = liveSessions.map(s => s.station);

    const togglePayMode = (mode) => {
        playSound('click');
        updateField('paymentMode', mode);
        if (mode !== 'Split') setSplits({ cash: 0, upi: 0, card: 0 });
    };

    const totalAdvance = form.paymentMode === 'Split'
        ? (parseInt(splits.cash || 0) + parseInt(splits.upi || 0) + parseInt(splits.card || 0))
        : parseInt(splits.cash || 0);

    const handleStart = async () => {
        if (!form.name.trim()) { showToast("Name is required", true); playSound('error'); return; }
        if (!form.station) { showToast("Select a station", true); playSound('error'); return; }

        let prepayAmount = 0;
        let pMode = form.paymentMode;

        if (pMode === 'Split') {
            prepayAmount = totalAdvance;
            pMode = `Split (C:${splits.cash} U:${splits.upi} Card:${splits.card})`;
        } else {
            prepayAmount = splits[pMode.toLowerCase()] || 0;
        }

        const isPS5 = form.station.startsWith('PS5');
        const dur = parseInt(form.duration, 10);

        const newSess = {
            id: Date.now().toString(),
            name: form.name.trim(),
            phone: form.phone.trim(),
            station: form.station,
            stationIcon: isPS5 ? '🎮' : '💻',
            players: isPS5 ? parseInt(form.players, 10) : 1,
            duration: dur,
            durationLabel: dur === 0 ? 'Open' : (dur % 60 === 0 ? `${dur / 60} Hr` : `${dur} Min`),
            isOpen: dur === 0,
            bookedSeconds: dur * 60,
            elapsedSeconds: 0,
            rate: rate,
            prepayment: prepayAmount,
            payment: pMode,
            notes: form.notes.trim(),
            status: 'active',
            foodOrders: [],
            startTime: new Date().toISOString()
        };

        if (supabase) {
            try {
                await supabase.from('sessions').insert([newSess]);
                console.log('Synced session implicitly to cloud');
            }
            catch (e) { console.warn('Supabase sync failed', e); }
        }

        playSound('success');
        showToast("Session Started!", false);
        navigate('/live');
    };

    return (
        <div className="page active" id="page-new-session" style={{ animation: 'fadeIn .2s ease' }}>
            <div style={{ padding: '0 16px 20px' }}>
                <div className="form-group"><label className="form-label">CUSTOMER NAME</label><input className="form-input" type="text" placeholder="Enter customer name" value={form.name} onChange={e => updateField('name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">PHONE (OPTIONAL)</label><input className="form-input" type="tel" placeholder="+91 9999999999" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>

                <div className="form-group">
                    <label className="form-label">SELECT STATION</label>
                    <select className="form-input form-select" value={form.station} onChange={e => updateField('station', e.target.value)}>
                        <option value="">— Choose station —</option>
                        <optgroup label="PS5 (CONSOLE)">{ps5Stations.map(s => <option key={s} value={s} disabled={activeStationNames.includes(s)}>{s} {activeStationNames.includes(s) ? '(IN USE)' : ''}</option>)}</optgroup>
                        <optgroup label="PC (GAMING)">{pcStations.map(s => <option key={s} value={s} disabled={activeStationNames.includes(s)}>{s} {activeStationNames.includes(s) ? '(IN USE)' : ''}</option>)}</optgroup>
                    </select>
                </div>

                {form.station.startsWith('PS5') && (
                    <div className="form-group">
                        <label className="form-label">PLAYERS</label>
                        <select className="form-input form-select" value={form.players} onChange={e => updateField('players', e.target.value)}>
                            {[1, 2, 3, 4].map(p => <option key={p} value={p}>{p} Player{p > 1 ? 's' : ''}</option>)}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">DURATION</label>
                    <select className="form-input form-select" value={form.duration} onChange={e => updateField('duration', e.target.value)}>
                        <option value="30">30 Minutes</option><option value="60">1 Hour</option><option value="90">1.5 Hours</option>
                        <option value="120">2 Hours</option><option value="180">3 Hours</option><option value="0">Open (No Limit)</option>
                    </select>
                </div>

                <div style={{ background: 'rgba(0,245,255,.06)', border: '1px solid rgba(0,245,255,.2)', borderRadius: '14px', padding: '14px 16px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '700', color: 'var(--muted)', letterSpacing: '1.5px' }}>SESSION RATE</span>
                        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '26px', fontWeight: '900', color: 'var(--neon)' }}>{form.duration === '0' ? 'OPEN' : form.station ? `₹${rate}` : '—'}</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">ADVANCE PAYMENT (optional)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '10px' }}>
                        {['Cash', 'UPI', 'Card', 'Split'].map(m => {
                            const isAct = form.paymentMode === m;
                            return (
                                <div key={m} onClick={() => togglePayMode(m)} style={{ padding: '9px 4px', borderRadius: '11px', textAlign: 'center', cursor: 'pointer', border: `2px solid ${isAct ? 'var(--neon)' : 'var(--border)'}`, background: isAct ? 'rgba(0,245,255,.1)' : 'var(--surface2)' }}>
                                    <div style={{ fontSize: '18px' }}>{m === 'Cash' ? '💵' : m === 'UPI' ? '📱' : m === 'Card' ? '💳' : '➗'}</div>
                                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '800', color: isAct ? 'var(--neon)' : 'var(--muted)', marginTop: '3px' }}>{m.toUpperCase()}</div>
                                </div>
                            );
                        })}
                    </div>

                    {form.paymentMode !== 'Split' ? (
                        <div style={{ marginBottom: '14px' }}><input className="form-input" type="number" placeholder={`${form.paymentMode} Amount...`} value={splits[form.paymentMode.toLowerCase()] || ''} onChange={e => setSplits(p => ({ ...p, [form.paymentMode.toLowerCase()]: e.target.value }))} style={{ fontSize: '16px' }} /></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div><label style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: 'var(--neon)', display: 'block', marginBottom: '4px' }}>💵 CASH ₹</label><input className="form-input" type="number" value={splits.cash || ''} onChange={e => setSplits(p => ({ ...p, cash: e.target.value }))} /></div>
                            <div><label style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: 'var(--neon3)', display: 'block', marginBottom: '4px' }}>📱 UPI ₹</label><input className="form-input" type="number" value={splits.upi || ''} onChange={e => setSplits(p => ({ ...p, upi: e.target.value }))} /></div>
                            <div><label style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: 'var(--success)', display: 'block', marginBottom: '4px' }}>💳 CARD ₹</label><input className="form-input" type="number" value={splits.card || ''} onChange={e => setSplits(p => ({ ...p, card: e.target.value }))} /></div>
                        </div>
                    )}
                </div>

                <div className="form-group"><label className="form-label">NOTES</label><input className="form-input" type="text" placeholder="Any special notes..." value={form.notes} onChange={e => updateField('notes', e.target.value)} /></div>

                <button className="btn-primary" onClick={handleStart} onMouseDown={() => playSound('click')}>🎮 START SESSION</button>
            </div>
        </div>
    );
};

export default NewSession;
