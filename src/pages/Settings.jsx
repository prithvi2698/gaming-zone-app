import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { playSound } from '../lib/sounds';
import { supabase } from '../lib/supabase';

const Settings = () => {
    const navigate = useNavigate();
    const {
        appSettings, setAppSettings,
        activeProfile,
        ps5Stations, setPs5Stations,
        pcStations, setPcStations,
        PS5_RATES, PC_RATES,
        setPS5_RATES, setPC_RATES,
        foodItems, setFoodItems,
        showToast
    } = useAppContext();

    const [activeModal, setActiveModal] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(!document.body.classList.contains('light-mode'));

    // Modal Form States
    const [tempArenaName, setTempArenaName] = useState('');
    const [tempOpenTime, setTempOpenTime] = useState('');
    const [tempCloseTime, setTempCloseTime] = useState('');
    const [newStationType, setNewStationType] = useState('PS5');
    const [newFoodName, setNewFoodName] = useState('');
    const [newFoodEmoji, setNewFoodEmoji] = useState('🍽️');
    const [newFoodPrice, setNewFoodPrice] = useState('');

    const [tempPCRates, setTempPCRates] = useState({});
    const [tempPS5Rates, setTempPS5Rates] = useState({});

    const openModal = (type) => {
        playSound('click');
        if (type === 'arena') setTempArenaName(appSettings.arenaName);
        if (type === 'hours') {
            setTempOpenTime(appSettings.openTime);
            setTempCloseTime(appSettings.closeTime);
        }
        if (type === 'pricing') {
            setTempPCRates({ ...PC_RATES });
            setTempPS5Rates({
                30: { ...PS5_RATES[30] },
                60: { ...PS5_RATES[60] },
                90: { ...PS5_RATES[90] },
                120: { ...PS5_RATES[120] },
                180: { ...PS5_RATES[180] },
                240: { ...PS5_RATES[240] },
                300: { ...PS5_RATES[300] }
            });
        }
        setActiveModal(type);
    };

    const closeModal = () => setActiveModal(null);

    const handleSaveArena = async () => {
        const newVal = { ...appSettings, arenaName: tempArenaName }; 
        setAppSettings(newVal);
        if (supabase) {
            await supabase.from('app_settings').upsert({ key: 'GLOBAL_SETTINGS', value: newVal });
            // Sync owner profile name (ID 1) with new arena name
            await supabase.from('staff_profiles').update({ name: tempArenaName }).eq('id', '1');
        }
        // Also update local state for fast UI refresh if they don't want to wait for subscription
        const updatedStaff = [...staffProfiles];
        const ownerIdx = updatedStaff.findIndex(s => s.id === '1' || s.role === 'Owner');
        if (ownerIdx !== -1) {
            updatedStaff[ownerIdx].name = tempArenaName;
            setStaffProfiles(updatedStaff);
        }

        showToast('Arena Name Updated');
        closeModal();
    };

    const handleSaveHours = async () => {
        const newVal = { ...appSettings, openTime: tempOpenTime, closeTime: tempCloseTime };
        setAppSettings(newVal);
        if (supabase) await supabase.from('app_settings').upsert({ key: 'GLOBAL_SETTINGS', value: newVal });
        showToast('Working Hours Updated');
        closeModal();
    };

    const handleSavePricing = async () => {
        setPC_RATES(tempPCRates);
        setPS5_RATES(tempPS5Rates);
        if (supabase) {
            await supabase.from('app_settings').upsert({ key: 'PC_RATES', value: tempPCRates });
            await supabase.from('app_settings').upsert({ key: 'PS5_RATES', value: tempPS5Rates });
        }
        showToast('Pricing Updated');
        closeModal();
    };

    const handleAddStation = () => {
        if (newStationType === 'PS5') {
            const nextIdx = ps5Stations.length + 1;
            setPs5Stations([...ps5Stations, `PS5 – #${String(nextIdx).padStart(2, '0')}`]);
        } else {
            const nextIdx = pcStations.length + 1;
            setPcStations([...pcStations, `PC – #${String(nextIdx).padStart(2, '0')}`]);
        }
    };

    const handleRemoveStation = (type, index) => {
        if (type === 'PS5') {
            setPs5Stations(ps5Stations.filter((_, i) => i !== index));
        } else {
            setPcStations(pcStations.filter((_, i) => i !== index));
        }
    };

    const handleAddFood = () => {
        if (!newFoodName || !newFoodPrice) return showToast('Fill name and price', true);
        const item = { id: Date.now(), name: newFoodName, emoji: newFoodEmoji, price: parseInt(newFoodPrice), is_active: true };
        setFoodItems([...foodItems, item]);
        setNewFoodName('');
        setNewFoodPrice('');
    };

    const handleRemoveFood = (id) => {
        setFoodItems(foodItems.filter(f => f.id !== id));
    };

    const toggleDarkMode = () => {
        playSound('click');
        document.body.classList.toggle('light-mode');
        setIsDarkMode(!document.body.classList.contains('light-mode'));
    };

    const confirmReload = () => {
        playSound('click');
        if (window.confirm("Reload Application?")) {
            window.location.reload();
        }
    };

    return (
        <div className="page active" id="page-settings" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header">
                <h2>SETTINGS</h2>
            </div>
            <div className="settings-list">
                
                {/* Arena Name setting row */}
                <div className="setting-row" onClick={() => openModal('arena')}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>🏟️</div>
                        <div>
                            <div className="setting-title">Arena Name</div>
                            <div className="setting-subtitle">{appSettings.arenaName}</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* Working Hours setting row */}
                <div className="setting-row" onClick={() => openModal('hours')}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>🕒</div>
                        <div>
                            <div className="setting-title">Working Hours</div>
                            <div className="setting-subtitle">{appSettings.openTime} – {appSettings.closeTime}</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* Manage Stations setting row */}
                <div className="setting-row" onClick={() => openModal('stations')}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>🎛️</div>
                        <div>
                            <div className="setting-title">Manage Stations</div>
                            <div className="setting-subtitle">Add / remove stations</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* Pricing setting row */}
                <div className="setting-row" onClick={() => openModal('pricing')}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>💸</div>
                        <div>
                            <div className="setting-title">Pricing</div>
                            <div className="setting-subtitle">Rates per hour</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* Food Items setting row */}
                <div className="setting-row" onClick={() => openModal('food')}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>🍔</div>
                        <div>
                            <div className="setting-title">Food Items</div>
                            <div className="setting-subtitle">Manage menu</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* My Profile setting row */}
                <div className="setting-row" onClick={() => openModal('profile')}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>👤</div>
                        <div>
                            <div className="setting-title">My Profile</div>
                            <div className="setting-subtitle">{activeProfile ? `${activeProfile.name} • ${activeProfile.role}` : appSettings.staffName + ' • ' + appSettings.staffRole}</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* Owner Dashboard Row */}
                <div className="setting-row" onClick={() => { playSound('click'); navigate('/owner'); }} style={{ borderColor: 'rgba(255,215,0,.2)' }}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>👑</div>
                        <div>
                            <div className="setting-title" style={{ color: 'var(--gold)' }}>Owner Dashboard</div>
                            <div className="setting-subtitle">Manage Business & Analytics</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

                {/* Dark Mode setting row */}
                <div className="setting-row" onClick={toggleDarkMode}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>🌙</div>
                        <div>
                            <div className="setting-title">Dark Mode</div>
                            <div className="setting-subtitle">Currently: {isDarkMode ? 'Dark' : 'Light'}</div>
                        </div>
                    </div>
                    <div className={`toggle ${isDarkMode ? 'on' : ''}`} style={{ width: '40px', height: '22px', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0, background: isDarkMode ? 'var(--neon)' : 'var(--border)' }}>
                        <div style={{ position: 'absolute', top: '3px', left: isDarkMode ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }}></div>
                    </div>
                </div>

                {/* Reload App Row */}
                <div className="setting-row" onClick={confirmReload} style={{ borderColor: 'rgba(255,0,110,.2)' }}>
                    <div className="setting-left">
                        <div className="setting-icon" style={{ fontSize: '20px' }}>🚪</div>
                        <div>
                            <div className="setting-title" style={{ color: 'var(--neon2)' }}>Reload App</div>
                            <div className="setting-subtitle">Refresh & reconnect DB</div>
                        </div>
                    </div>
                    <div className="setting-right" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>❯</div>
                </div>

            </div>

            {/* General Setting Modal Wrapper */}
            {activeModal && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <span className="modal-close" onClick={closeModal} style={{ position: 'absolute', right: '16px', top: '14px', cursor: 'pointer', color: 'var(--muted)', fontSize: '18px' }}>✕</span>
                        
                        {/* Arena Name Content */}
                        {activeModal === 'arena' && (
                            <div>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '18px' }}>🏟️ EDIT ARENA NAME</div>
                                <div className="form-group" style={{ marginBottom: '14px' }}>
                                    <label className="form-label">ARENA NAME</label>
                                    <input className="form-input" type="text" value={tempArenaName} onChange={e => setTempArenaName(e.target.value)} />
                                </div>
                                <button className="btn-primary" onClick={handleSaveArena}>SAVE CHANGES</button>
                            </div>
                        )}

                        {/* Working Hours Content */}
                        {activeModal === 'hours' && (
                            <div>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '18px' }}>🕒 EDIT WORKING HOURS</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                    <div className="form-group">
                                        <label className="form-label">OPENING TIME</label>
                                        <input className="form-input" type="time" value={tempOpenTime} onChange={e => setTempOpenTime(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CLOSING TIME</label>
                                        <input className="form-input" type="time" value={tempCloseTime} onChange={e => setTempCloseTime(e.target.value)} />
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={handleSaveHours}>SAVE HOURS</button>
                            </div>
                        )}

                        {/* Manage Stations Content */}
                        {activeModal === 'stations' && (
                            <div>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '18px' }}>🎛️ MANAGE STATIONS</div>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: 'var(--neon)' }}>PS5 STATIONS</div>
                                    {ps5Stations.map((st, i) => (
                                        <div key={st} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(0,245,255,.05)', border: '1px solid rgba(0,245,255,.15)', borderRadius: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{st}</span>
                                            <button onClick={() => handleRemoveStation('PS5', i)} style={{ background: 'rgba(255,0,110,.1)', border: '1px solid rgba(255,0,110,.3)', color: 'var(--neon2)', borderRadius: '4px', cursor: 'pointer', padding: '0 6px', fontSize: '11px' }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: 'var(--neon3)' }}>PC STATIONS</div>
                                    {pcStations.map((st, i) => (
                                        <div key={st} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.15)', borderRadius: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{st}</span>
                                            <button onClick={() => handleRemoveStation('PC', i)} style={{ background: 'rgba(255,0,110,.1)', border: '1px solid rgba(255,0,110,.3)', color: 'var(--neon2)', borderRadius: '4px', cursor: 'pointer', padding: '0 6px', fontSize: '11px' }}>✕</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select className="form-input form-select" value={newStationType} onChange={e => setNewStationType(e.target.value)} style={{ flex: 1, padding: '10px' }}>
                                        <option value="PS5">PS5</option>
                                        <option value="PC">PC</option>
                                    </select>
                                    <button onClick={handleAddStation} className="btn-primary" style={{ flex: 2, padding: '10px' }}>+ ADD STATION</button>
                                </div>
                            </div>
                        )}

                        {/* Pricing Content */}
                        {activeModal === 'pricing' && (
                            <div>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '18px' }}>💸 EDIT PRICING</div>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: 'var(--surface2)', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
                                        <h4 style={{ color: 'var(--neon)', fontFamily: "'Orbitron', monospace", fontSize: '10px', marginBottom: '10px' }}>PS5 RATES (1 Player base)</h4>
                                        {[30, 60, 90, 120, 180, 240, 300].map(mins => (
                                            <div key={mins} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{ width: '60px', fontSize: '12px', color: 'var(--text)' }}>{mins} min</div>
                                                <input className="form-input" type="number" 
                                                    value={tempPS5Rates[mins]?.[1] || 0} 
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setTempPS5Rates(prev => ({ ...prev, [mins]: { ...prev[mins], 1: val } }));
                                                    }} 
                                                    style={{ flex: 1, padding: '4px 8px', height: '30px', margin: 0 }} 
                                                />
                                            </div>
                                        ))}
                                        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px' }}>Other player counts (2,3,4) will maintain their offset unless modified from source.</div>
                                    </div>

                                    <div style={{ backgroundColor: 'var(--surface2)', padding: '10px', borderRadius: '10px' }}>
                                        <h4 style={{ color: 'var(--neon3)', fontFamily: "'Orbitron', monospace", fontSize: '10px', marginBottom: '10px' }}>PC RATES</h4>
                                        {[30, 60, 90, 120, 180, 240, 300].map(mins => (
                                            <div key={mins} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{ width: '60px', fontSize: '12px', color: 'var(--text)' }}>{mins} min</div>
                                                <input className="form-input" type="number" 
                                                    value={tempPCRates[mins] || 0} 
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setTempPCRates(prev => ({ ...prev, [mins]: val }));
                                                    }} 
                                                    style={{ flex: 1, padding: '4px 8px', height: '30px', margin: 0 }} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={handleSavePricing}>SAVE PRICING</button>
                            </div>
                        )}

                        {/* Food Items Content */}
                        {activeModal === 'food' && (
                            <div>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '18px' }}>🍔 MANAGE FOOD</div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {foodItems.map(f => (
                                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{f.emoji} {f.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--warning)' }}>₹{f.price}</div>
                                            </div>
                                            <button onClick={() => handleRemoveFood(f.id)} style={{ background: 'transparent', border: 'none', color: 'var(--neon2)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input className="form-input" placeholder="Emoji (e.g. 🍟)" value={newFoodEmoji} onChange={e => setNewFoodEmoji(e.target.value)} style={{ flex: 1, padding: '8px' }} />
                                        <input className="form-input" placeholder="Name" value={newFoodName} onChange={e => setNewFoodName(e.target.value)} style={{ flex: 2, padding: '8px' }} />
                                        <input className="form-input" type="number" placeholder="Price" value={newFoodPrice} onChange={e => setNewFoodPrice(e.target.value)} style={{ flex: 1, padding: '8px' }} />
                                    </div>
                                    <button className="btn-primary" onClick={handleAddFood}>+ ADD ITEM</button>
                                </div>
                            </div>
                        )}

                        {/* Profile Content */}
                        {activeModal === 'profile' && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '18px' }}>👤 MY PROFILE</div>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🆔</div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{activeProfile ? activeProfile.name : appSettings.staffName}</div>
                                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: 'var(--gold)', letterSpacing: '1px', marginTop: '4px', marginBottom: '14px' }}>{activeProfile ? activeProfile.role.toUpperCase() : appSettings.staffRole.toUpperCase()}</div>
                                
                                <div style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '12px', color: 'var(--muted)' }}>
                                    <div style={{ marginBottom: '4px' }}><strong>Status:</strong> Active</div>
                                    <div style={{ marginBottom: '4px' }}><strong>Branch:</strong> {appSettings.arenaName}</div>
                                    <div><strong>Access:</strong> {activeProfile?.role === 'Owner' || activeProfile?.role === 'Manager' ? 'Full Access' : 'Restricted'}</div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
