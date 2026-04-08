import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';

const Accounts = () => {
    const { accountBalances, history, setAccountBalances, showToast, appSettings } = useAppContext();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ account: 'Cash Register', amount: '', type: 'deposit' });

    const handleTransaction = async () => {
        if (!form.amount) {
            playSound('error');
            return;
        }
        playSound('success');
        const amt = parseFloat(form.amount);
        setAccountBalances(prev => ({
            ...prev,
            [form.account]: prev[form.account] + (form.type === 'deposit' ? amt : -amt)
        }));

        showToast(`${form.type === 'deposit' ? 'Deposited' : 'Withdrawn'} ₹${amt}`, false);
        setModalOpen(false);
        setForm({ ...form, amount: '' });

        if (supabase) {
            try { await supabase.from('account_transactions').insert([{ account: form.account, type: form.type, amount: amt }]); }
            catch { /* ignore */ }
        }
    };

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayHistory = history.filter(h => (h.ended_at || '').startsWith(todayStr));

    const cashTotal = todayHistory.filter(h => h.finalPaymentMode === 'Cash').reduce((sum, h) => sum + h.finalAmountPaid, 0);
    const upiTotal = todayHistory.filter(h => h.finalPaymentMode === 'UPI').reduce((sum, h) => sum + h.finalAmountPaid, 0);
    const cardTotal = todayHistory.filter(h => h.finalPaymentMode === 'Card').reduce((sum, h) => sum + h.finalAmountPaid, 0);
    const totalColl = cashTotal + upiTotal + cardTotal;

    const accArray = [
        { name: 'Cash Register', type: 'cash', balance: accountBalances['Cash Register'] || 0, icon: '💵' },
        { name: 'PhonePe / UPI', type: 'upi', balance: accountBalances['PhonePe / UPI'] || 0, icon: '📱' },
        { name: 'HDFC Business', type: 'bank', balance: accountBalances['HDFC Business'] || 0, icon: '🏦' }
    ];

    const handleExportData = () => {
        const headers = ["Account Name", "Type", "Current Balance (Rs)"];
        const rows = accArray.map(a => [a.name, a.type.toUpperCase(), a.balance].join(','));
        
        const totalRows = [
            [],
            ["TODAY'S COLLECTIONS", "", ""],
            ["Cash", "", cashTotal],
            ["UPI", "", upiTotal],
            ["Card", "", cardTotal],
            ["Total", "", totalColl]
        ].map(r => r.join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows, ...totalRows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const arenaPrefix = (appSettings?.arenaName || 'pixel_gaming').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        link.setAttribute("download", `${arenaPrefix}_accounts.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Exported accounts to CSV');
    };

    return (
        <div className="page active" id="page-accounts" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <h2>ACCOUNTS</h2>
                    <button 
                        onClick={handleExportData}
                        style={{ padding: '4px 8px', fontSize: '10px', background: 'rgba(0,245,255,.1)', border: '1px solid rgba(0,245,255,.3)', color: 'var(--neon)', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Orbitron', monospace", fontWeight: '700' }}
                    >
                        📥 CSV
                    </button>
                </div>
                <button className="add-btn" onClick={() => { playSound('click'); setModalOpen(true); }}>➕ Entry</button>
            </div>

            <div style={{ padding: '0 16px 4px' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '700', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '10px' }}>TODAY'S COLLECTION</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ background: 'rgba(0,255,136,.06)', border: '1px solid rgba(0,255,136,.2)', borderRadius: '12px', padding: '11px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>💵</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', color: 'var(--success)' }}>₹{cashTotal}</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '3px', letterSpacing: '1px' }}>CASH</div>
                    </div>
                    <div style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)', borderRadius: '12px', padding: '11px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>📱</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', color: 'var(--neon3)' }}>₹{upiTotal}</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '3px', letterSpacing: '1px' }}>UPI</div>
                    </div>
                    <div style={{ background: 'rgba(0,245,255,.06)', border: '1px solid rgba(0,245,255,.2)', borderRadius: '12px', padding: '11px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>💳</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', color: 'var(--neon)' }}>₹{cardTotal}</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '3px', letterSpacing: '1px' }}>CARD</div>
                    </div>
                    <div style={{ background: 'rgba(255,215,0,.06)', border: '1px solid rgba(255,215,0,.2)', borderRadius: '12px', padding: '11px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>✅</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', color: 'var(--gold)' }}>₹{totalColl}</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '7px', color: 'var(--muted)', marginTop: '3px', letterSpacing: '1px' }}>TOTAL</div>
                    </div>
                </div>
            </div>

            <div className="section-title" style={{ marginTop: '4px' }}>ACCOUNT BALANCES</div>
            <div className="account-list" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {accArray.map(a => (
                    <div key={a.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '700' }}>{a.icon} {a.name}</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '700', letterSpacing: '1px', padding: '3px 8px', borderRadius: '6px', background: a.type === 'cash' ? 'rgba(0,255,136,.1)' : a.type === 'bank' ? 'rgba(0,245,255,.1)' : 'rgba(168,85,247,.1)', color: a.type === 'cash' ? 'var(--success)' : a.type === 'bank' ? 'var(--neon)' : 'var(--neon3)', border: `1px solid ${a.type === 'cash' ? 'rgba(0,255,136,.3)' : a.type === 'bank' ? 'rgba(0,245,255,.3)' : 'rgba(168,85,247,.3)'}` }}>
                                {a.type.toUpperCase()}
                            </div>
                        </div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '22px', fontWeight: '900', color: 'var(--neon)', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>₹</span> {a.balance}
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => { playSound('click'); setModalOpen(false); }}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease' }}>
                        <div className="modal-close" onClick={() => { playSound('click'); setModalOpen(false); }}>✕</div>
                        <div className="modal-title" style={{ color: 'var(--neon)' }}>🏦 ACCOUNT ENTRY</div>

                        <div className="form-group">
                            <label className="form-label">SELECT ACCOUNT</label>
                            <select className="form-input form-select" value={form.account} onChange={e => { playSound('click'); setForm(p => ({ ...p, account: e.target.value })); }}>
                                <option value="Cash Register">Cash Register</option>
                                <option value="PhonePe / UPI">PhonePe / UPI</option>
                                <option value="HDFC Business">HDFC Business</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">TRANSACTION TYPE</label>
                            <select className="form-input form-select" value={form.type} onChange={e => { playSound('click'); setForm(p => ({ ...p, type: e.target.value })); }}>
                                <option value="deposit">Deposit / Add Funds</option>
                                <option value="withdrawal">Withdrawal / Deduct</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">AMOUNT (₹)</label>
                            <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                        </div>

                        <button className="btn-primary" onClick={handleTransaction}>CONFIRM ENTRY</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
