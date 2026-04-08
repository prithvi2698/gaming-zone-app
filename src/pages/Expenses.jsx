import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';

const Expenses = () => {
    const { expenses, setExpenses, showToast, appSettings } = useAppContext();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', amount: '', category: 'Other', date: new Date().toISOString().slice(0, 10) });

    const handleAdd = async () => {
        if (!form.name || !form.amount) {
            playSound('error');
            showToast('Enter name and amount', true);
            return;
        }
        playSound('success');
        const exp = {
            id: Date.now(),
            name: form.name,
            amount: parseFloat(form.amount),
            category: form.category,
            date: form.date
        };

        if (supabase) {
            try { await supabase.from('expenses').insert([exp]); }
            catch { console.warn('Supabase expense sync failed'); }
        }

        setModalOpen(false);
        setForm({ name: '', amount: '', category: 'Other', date: new Date().toISOString().slice(0, 10) });
        showToast('Expense Added', false);
    };

    const monthTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const allTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    const getIcon = (cat) => {
        switch (cat) {
            case 'Electricity': return '⚡';
            case 'Maintenance': return '🔧';
            case 'Salaries': return '👥';
            case 'Internet': return '🌐';
            default: return '💸';
        }
    };

    const handleExportData = () => {
        if (expenses.length === 0) return showToast('No expenses to export', true);
        
        const headers = ["Date", "Expense Name", "Category", "Amount (Rs)"];
        const rows = expenses.map(e => {
            const name = `"${e.name}"`;
            return [e.date, name, e.category, e.amount].join(',');
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const arenaPrefix = (appSettings?.arenaName || 'pixel_gaming').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        link.setAttribute("download", `${arenaPrefix}_expenses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Exported to CSV successfully');
    };

    return (
        <div className="page active" id="page-expenses" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <h2>EXPENSES</h2>
                    <button 
                        onClick={handleExportData}
                        style={{ padding: '4px 8px', fontSize: '10px', background: 'rgba(0,245,255,.1)', border: '1px solid rgba(0,245,255,.3)', color: 'var(--neon)', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Orbitron', monospace", fontWeight: '700' }}
                    >
                        📥 CSV
                    </button>
                </div>
                <button className="add-btn" onClick={() => { playSound('click'); setModalOpen(true); }}>➕ Expense</button>
            </div>

            <div className="summary-cards" style={{ padding: '8px 16px 4px' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px' }}>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '700', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '4px' }}>This Month</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: '900', color: 'var(--neon2)' }}>₹{monthTotal}</div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px' }}>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: '700', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '4px' }}>Total</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: '900', color: 'var(--gold)' }}>₹{allTotal}</div>
                </div>
            </div>

            <div className="section-title">RECENT EXPENSES</div>
            <div className="expense-list" style={{ padding: '0 16px' }}>
                {expenses.length === 0 ? (
                    <div className="empty-state">
                        <div className="es-icon">💸</div>
                        <div className="es-title">NO EXPENSES YET</div>
                        <div className="es-sub">Tap ➕ Add to record one</div>
                    </div>
                ) : (
                    expenses.map(e => (
                        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: 'var(--surface2)' }}>
                                {getIcon(e.category)}
                            </div>
                            <div style={{ flex: '1', minWidth: '0' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>{e.category}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: '700', color: 'var(--neon2)' }}>-₹{e.amount}</div>
                                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{new Date(e.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* EXPENSE MODAL */}
            {modalOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => { playSound('click'); setModalOpen(false); }}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 0.3s ease' }}>
                        <div className="modal-close" onClick={() => { playSound('click'); setModalOpen(false); }}>✕</div>
                        <div className="modal-title" style={{ color: 'var(--neon2)' }}>💸 ADD EXPENSE</div>

                        <div className="form-group">
                            <label className="form-label">EXPENSE NAME</label>
                            <input className="form-input" type="text" placeholder="e.g. Controller Repair" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">AMOUNT (₹)</label>
                            <input className="form-input" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CATEGORY</label>
                            <select className="form-input form-select" value={form.category} onChange={e => { playSound('click'); setForm(p => ({ ...p, category: e.target.value })); }}>
                                <option value="Electricity">Electricity</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Salaries">Salaries</option>
                                <option value="Internet">Internet</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">DATE</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>

                        <button className="btn-primary" style={{ background: 'linear-gradient(135deg,rgba(255,0,110,.8),rgba(255,149,0,.8))' }} onClick={handleAdd}>SUBMIT EXPENSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
