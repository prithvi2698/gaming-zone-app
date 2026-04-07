import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const formatTimeDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { liveSessions, history, appSettings, getRate } = useAppContext();
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            const ampm = h >= 12 ? 'PM' : 'AM';
            setCurrentTime(`${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`);

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            setCurrentDate(`${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} · ${appSettings.arenaName}`);
        };

        updateClock();
        const timer = setInterval(updateClock, 60000);
        return () => clearInterval(timer);
    }, [appSettings.arenaName]);

    // Calculate Stats
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySessions = history.filter(s => (s.ended_at || s.startTime?.toISOString() || '').startsWith(todayStr));
    const uniquePlayers = new Set(todaySessions.map(s => s.name)).size;
    const topPlayers = uniquePlayers; // Simplified for now, usually calculated from points leaderboard but UI says 'Top Players'

    return (
        <div className="page active" id="page-home" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="dash-greeting">
                <div className="time" id="greeting-time">{currentTime || '--:-- --'}</div>
                <p id="greeting-date">{currentDate || 'Loading...'}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card cyan" onClick={() => navigate('/live')}>
                    <div className="stat-icon">🎮</div>
                    <div className="stat-value">{liveSessions.length}</div>
                    <div className="stat-label">Live Sessions</div>
                </div>
                <div className="stat-card green" onClick={() => navigate('/history')}>
                    <div className="stat-icon">⚡</div>
                    <div className="stat-value">{todaySessions.length}</div>
                    <div className="stat-label">Today Sessions</div>
                </div>
                <div className="stat-card gold" onClick={() => navigate('/points')}>
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{uniquePlayers}</div>
                    <div className="stat-label">Total Players</div>
                </div>
                <div className="stat-card" style={{ borderColor: 'rgba(168,85,247,.25)', background: 'rgba(168,85,247,.04)', cursor: 'pointer' }} onClick={() => navigate('/points')}>
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value" style={{ color: 'var(--neon3)', fontFamily: "'Orbitron', monospace", fontSize: '24px', fontWeight: '900' }}>{topPlayers}</div>
                    <div className="stat-label" style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', marginTop: '2px' }}>Top Players</div>
                </div>
            </div>

            <div className="section-title">QUICK ACTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 16px' }}>
                <div onClick={() => navigate('/new-session')} style={{ background: 'linear-gradient(135deg,rgba(0,245,255,.1),rgba(168,85,247,.1))', border: '1px solid rgba(0,245,255,.25)', borderRadius: '14px', padding: '16px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎮</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '700' }}>NEW SESSION</div>
                </div>
                <div onClick={() => navigate('/expenses')} style={{ background: 'linear-gradient(135deg,rgba(255,0,110,.08),rgba(255,149,0,.08))', border: '1px solid rgba(255,0,110,.2)', borderRadius: '14px', padding: '16px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>💸</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '700' }}>ADD EXPENSE</div>
                </div>
            </div>

            <div className="section-title" style={{ marginTop: '8px' }}>LIVE NOW</div>
            <div id="dash-live-preview" style={{ padding: '0 16px' }}>
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
                        const baseRate = getRate(s.station, 60, s.players);
                        const displayRate = s.isOpen ? Math.round(baseRate * (elapsed / 3600)) : s.rate;
                        const total = displayRate + foodTotal;
                        const due = Math.max(0, total - (s.prepayment || 0));

                        const payIcon = s.payment === 'UPI' ? '📱' : s.payment === 'Card' ? '💳' : s.payment === 'Membership' ? '🎫' : '💵';
                        const cardBorder = isOver ? 'rgba(255,0,110,.35)' : isWarn ? 'rgba(255,149,0,.35)' : 'var(--border)';
                        const cardBg = isOver ? 'rgba(255,0,110,.04)' : isWarn ? 'rgba(255,149,0,.04)' : 'var(--surface)';

                        return (
                            <div key={s.id} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '14px', padding: '13px 14px', marginBottom: '10px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '2px', background: `linear-gradient(90deg,${timerColor},transparent)` }}></div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ flex: '1', minWidth: '0' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: s.station.startsWith('PS5') ? 'rgba(0,245,255,.1)' : 'rgba(168,85,247,.1)', color: s.station.startsWith('PS5') ? 'var(--neon)' : 'var(--neon3)' }}>
                                                {s.stationIcon} {s.station.replace('PS5 – ', 'PS5 ').replace('PC – ', 'PC ')}
                                            </span>
                                            {s.players > 1 && (
                                                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '700', padding: '2px 7px', borderRadius: '6px', background: 'rgba(168,85,247,.1)', color: 'var(--neon3)' }}>
                                                    {s.players}P
                                                </span>
                                            )}
                                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.durationLabel}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: '0', marginLeft: '12px' }}>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: '900', color: timerColor, lineHeight: '1' }}>{timerStr}</div>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: timerColor, opacity: '.7', marginTop: '2px', letterSpacing: '.5px' }}>{timerLabel}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '8px' }}>
                                    <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '7px 8px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', color: 'var(--muted)', marginBottom: '2px' }}>RATE</div>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: '800', color: 'var(--neon)' }}>₹{displayRate}</div>
                                    </div>
                                    <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '7px 8px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', color: 'var(--muted)', marginBottom: '2px' }}>TOTAL</div>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>₹{total}</div>
                                    </div>
                                    <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '7px 8px', textAlign: 'center' }}>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', color: 'var(--muted)', marginBottom: '2px' }}>DUE</div>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: '800', color: due > 0 ? 'var(--neon2)' : 'var(--success)' }}>₹{due}</div>
                                    </div>
                                </div>

                                {s.foodOrders && s.foodOrders.length > 0 && (
                                    <div style={{ padding: '8px 10px', background: 'rgba(255,149,0,.06)', border: '1px solid rgba(255,149,0,.15)', borderRadius: '9px', margin: '8px 0 0' }}>
                                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', color: 'var(--warning)', letterSpacing: '1px', marginBottom: '5px' }}>FOOD ORDERS</div>
                                        {s.foodOrders.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                                                <span>{f.emoji} {f.name}</span>
                                                <span style={{ color: 'var(--warning)' }}>₹{f.price}</span>
                                            </div>
                                        ))}
                                        <div style={{ borderTop: '1px solid rgba(255,149,0,.2)', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: 'var(--warning)' }}>
                                            <span>Food Total</span><span>₹{foodTotal}</span>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', flex: '1' }}>{payIcon} {s.payment}</span>
                                    <button onClick={(e) => { e.stopPropagation(); navigate('/live'); }} style={{ padding: '6px 12px', borderRadius: '9px', border: '1px solid rgba(0,245,255,.3)', background: 'rgba(0,245,255,.08)', color: 'var(--neon)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Manage Session</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Dashboard;
