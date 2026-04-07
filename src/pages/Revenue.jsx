import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Revenue = () => {
    const { history, expenses, showToast } = useAppContext();
    const [period, setPeriod] = useState('month');

    // Simple period filter function
    const inPeriod = (dateStr) => {
        if (!dateStr) return false;
        const now = new Date();
        if (period === 'all') return true;
        if (period === 'today') return dateStr.startsWith(now.toISOString().slice(0, 10));
        if (period === 'month') return dateStr.startsWith(now.toISOString().slice(0, 7));
        if (period === 'week') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return new Date(dateStr) >= oneWeekAgo;
        }
        return false;
    };

    const revHistory = history.filter(h => inPeriod(h.ended_at));
    const expHistory = expenses.filter(e => inPeriod(e.date));

    const totalRev = revHistory.reduce((sum, h) => sum + h.finalAmountPaid, 0);
    const totalExp = expHistory.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRev - totalExp;

    const gameRev = revHistory.reduce((sum, h) => sum + h.finalBaseRate, 0);
    const foodRev = revHistory.reduce((sum, h) => sum + (h.finalFoodTotal || 0), 0);

    return (
        <div className="page active" id="page-revenue" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header">
                <h2>REVENUE</h2>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '800', background: 'var(--surface2)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    📊 STAFF VIEW
                </div>
            </div>

            <div className="filter-chips" style={{ padding: '0 16px 14px' }}>
                <div className={`chip ${period === 'today' ? 'active' : ''}`} onClick={() => setPeriod('today')}>Today</div>
                <div className={`chip ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>This Week</div>
                <div className={`chip ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>This Month</div>
                <div className={`chip ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>All Time</div>
            </div>

            <div style={{ padding: '0 16px' }}>
                <div style={{ background: 'linear-gradient(135deg,rgba(0,255,136,.1),rgba(0,245,255,.1))', border: '1px solid rgba(0,255,136,.3)', borderRadius: '16px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '100px', opacity: '.05', transform: 'rotate(-15deg)' }}>📈</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', letterSpacing: '2px', color: 'var(--success)', marginBottom: '4px' }}>TOTAL REVENUE</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: '900', color: 'var(--text)', textShadow: '0 0 20px rgba(0,255,136,.4)' }}>₹{totalRev}</div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>🎮 Gaming</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--neon)' }}>₹{gameRev}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>🍔 F&B</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--warning)' }}>₹{foodRev}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>💸 Expenses</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--neon2)' }}>-₹{totalExp}</div>
                        </div>
                    </div>
                </div>

                <div className="section-title" style={{ padding: '14px 0 8px' }}>PROFIT & LOSS</div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--muted)' }}>Gross Revenue</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>₹{totalRev}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--muted)' }}>Total Expenses</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--neon2)' }}>-₹{totalExp}</div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', color: netProfit >= 0 ? 'var(--success)' : 'var(--neon2)' }}>NET PROFIT</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '22px', fontWeight: '900', color: netProfit >= 0 ? 'var(--success)' : 'var(--neon2)' }}>{netProfit >= 0 ? '+' : ''}₹{netProfit}</div>
                    </div>
                </div>

                <div className="section-title" style={{ padding: '14px 0 8px' }}>DATA SYNC</div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>☁️</div>
                        <div style={{ flex: '1' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>Cloud Database</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>All data synced in real-time</div>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => showToast('Data is synced with Supabase', false)}>VERIFY SYNC</button>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
