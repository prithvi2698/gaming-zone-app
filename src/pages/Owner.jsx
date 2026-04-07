import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const Owner = () => {
    const { history, expenses, staffProfiles, setStaffProfiles, appSettings, activeProfile, showToast } = useAppContext();
    const [period, setPeriod] = useState('all');
    const [editingPinId, setEditingPinId] = useState(null);
    const [newPin, setNewPin] = useState('');

    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffRole, setNewStaffRole] = useState('Staff');
    const [newStaffPin, setNewStaffPin] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

    const totalUsers = staffProfiles?.length || 0;
    const totalSessions = revHistory.length;

    const handleSavePin = async (id) => {
        if (!newPin || newPin.length !== 4) return showToast('PIN must be 4 digits', true);
        if (supabase) {
            const { error } = await supabase.from('staff_profiles').update({ pin: newPin }).eq('id', id);
            if (!error) showToast('PIN Updated Successfully');
        }
        setEditingPinId(null);
        setNewPin('');
    };

    const handleDeleteStaff = async (id) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            setTimeout(() => setConfirmDeleteId(null), 3000);
            return;
        }
        
        if (supabase) {
            const { error } = await supabase.from('staff_profiles').delete().eq('id', id);
            if (!error) {
                showToast('Staff removed successfully');
                setConfirmDeleteId(null);
            } else {
                console.error("Delete failed", error);
                showToast('Failed to remove staff', true);
            }
        }
    };

    const handleAddStaff = async () => {
        if (!newStaffName.trim()) return showToast('Name is required', true);
        if (!newStaffPin || newStaffPin.length !== 4) return showToast('PIN must be 4 digits', true);
        
        const newProfile = {
            id: Date.now().toString(),
            name: newStaffName,
            role: newStaffRole,
            pin: newStaffPin,
            is_active: true
        };
        
        if (supabase) {
            await supabase.from('staff_profiles').insert([newProfile]);
        }
        showToast('Staff added successfully');
        
        setIsAddingStaff(false);
        setNewStaffName('');
        setNewStaffRole('Staff');
        setNewStaffPin('');
    };

    const handleExportData = () => {
        if (revHistory.length === 0) return showToast('No sessions to export', true);
        
        const headers = ["Date", "Session Name", "Station", "Duration", "Base Rate (Rs)", "F&B Total (Rs)", "Total Paid (Rs)", "Payment Mode"];
        const rows = revHistory.map(s => {
            const date = new Date(s.ended_at).toLocaleString().replace(/,/g, '');
            const name = `"${s.name}"`;
            return [
                date,
                name,
                s.station,
                s.durationLabel || '',
                s.finalBaseRate || 0,
                s.finalFoodTotal || 0,
                s.finalAmountPaid || 0,
                s.finalPaymentMode || 'Cash'
            ].join(',');
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `battle_arena_sessions_${period}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Exported to CSV successfully');
    };

    return (
        <div className="page active" id="page-owner" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <h2>OWNER DASHBOARD</h2>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '800', background: 'var(--surface2)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
                        👑 OWNER
                    </div>
                </div>
                <button 
                    onClick={handleExportData}
                    style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(0,245,255,.1)', border: '1px solid rgba(0,245,255,.3)', color: 'var(--neon)', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Orbitron', monospace", fontWeight: '700' }}
                >
                    📥 CSV
                </button>
            </div>

            <div className="filter-chips" style={{ padding: '0 16px 14px' }}>
                <div className={`chip ${period === 'today' ? 'active' : ''}`} onClick={() => setPeriod('today')}>Today</div>
                <div className={`chip ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>This Week</div>
                <div className={`chip ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>This Month</div>
                <div className={`chip ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>All Time</div>
            </div>

            <div style={{ padding: '0 16px' }}>
                {/* Net Profit Core Display */}
                <div style={{ background: 'linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,165,0,.1))', border: '1px solid rgba(255,215,0,.3)', borderRadius: '16px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '100px', opacity: '.05', transform: 'rotate(-15deg)' }}>💰</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '800', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '4px' }}>NET PROFIT</div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: '900', color: 'var(--text)', textShadow: '0 0 20px rgba(255,215,0,.4)' }}>
                        {netProfit >= 0 ? '+' : ''}₹{netProfit}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Gross Revenue</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--success)' }}>₹{totalRev}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Total Expenses</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: '700', color: 'var(--neon2)' }}>-₹{totalExp}</div>
                        </div>
                    </div>
                </div>

                {/* Sub Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🕹️</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: '800' }}>₹{gameRev}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Gaming Revenue</div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🍿</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: '800' }}>₹{foodRev}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>F&B Revenue</div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>👥</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: '800' }}>{totalUsers}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Total Registered Users</div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎫</div>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: '800' }}>{totalSessions}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Total Sessions</div>
                    </div>
                </div>

                <div className="section-title" style={{ padding: '14px 0 8px' }}>BUSINESS CONTROLS</div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>Branch Name</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{appSettings.branchName || 'Main Branch'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>Current Manager</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{appSettings.staffName || 'Guest'}</div>
                        </div>
                        <div style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
                            {appSettings.staffRole || 'Role'}
                        </div>
                    </div>
                </div>

                {/* STAFF MANAGEMENT */}
                {activeProfile?.role === 'Owner' && (
                <>
                    <div className="section-title" style={{ padding: '24px 0 8px' }}>STAFF MANAGEMENT</div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginBottom: '30px' }}>
                        {staffProfiles.map((profile, i) => (
                            <div key={profile.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === staffProfiles.length - 1 ? 'none' : '1px solid var(--border)', marginBottom: i === staffProfiles.length - 1 ? '16px' : '0' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{profile.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{profile.role}</div>
                                </div>
                                <div>
                                    {editingPinId === profile.id ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                className="form-input" 
                                                type="text" 
                                                maxLength="4" 
                                                placeholder="New PIN" 
                                                value={newPin} 
                                                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                                style={{ width: '80px', padding: '4px 8px', textAlign: 'center' }} 
                                            />
                                            <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => handleSavePin(profile.id)}>Save</button>
                                            <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }} onClick={() => { setEditingPinId(null); setNewPin(''); }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                className="btn-primary" 
                                                style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} 
                                                onClick={() => { setEditingPinId(profile.id); setNewPin(''); }}
                                            >
                                                Edit PIN
                                            </button>
                                            {profile.role !== 'Owner' && (
                                                <button 
                                                    style={{ marginLeft: '8px', padding: '6px 12px', fontSize: '11px', background: confirmDeleteId === profile.id ? 'var(--warning)' : 'rgba(255,0,110,.1)', border: confirmDeleteId === profile.id ? '1px solid var(--warning)' : '1px solid rgba(255,0,110,.3)', color: confirmDeleteId === profile.id ? '#000' : 'var(--neon2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} 
                                                    onClick={() => handleDeleteStaff(profile.id)}
                                                >
                                                    {confirmDeleteId === profile.id ? 'Confirm?' : 'Remove'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed var(--border)' }}>
                            {!isAddingStaff ? (
                                <button className="btn-primary" onClick={() => setIsAddingStaff(true)}>+ Add Staff</button>
                            ) : (
                                <div style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', width: '100%' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '8px', marginBottom: '12px' }}>
                                        <input className="form-input" placeholder="Name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
                                        <select className="form-input form-select" value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} style={{ padding: '0 10px', height: '100%' }}>
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Co-Owner">Co-Owner</option>
                                            <option value="Owner">Owner</option>
                                        </select>
                                        <input className="form-input" type="text" maxLength="4" placeholder="PIN" value={newStaffPin} onChange={e => setNewStaffPin(e.target.value.replace(/\D/g, ''))} style={{ textAlign: 'center' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', padding: '6px 16px', fontSize: '11px', cursor: 'pointer' }} onClick={() => setIsAddingStaff(false)}>Cancel</button>
                                        <button className="btn-primary" onClick={handleAddStaff}>Save Profile</button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </>
                )}

            </div>
        </div>
    );
};

export default Owner;
