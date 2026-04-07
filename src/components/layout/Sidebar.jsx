import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
    const { activeProfile, setActiveProfile } = useAppContext();
    const initials = (activeProfile?.name || 'BA').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
    const role = activeProfile?.role || 'Staff';

    // Role styling
    const roleColors = { 'Owner': 'var(--gold)', 'Co-Owner': 'var(--neon)', 'Staff': 'var(--muted)' };
    const color = roleColors[role] || 'var(--muted)';
    const bg = `rgba(${role === 'Owner' ? '255,215,0' : role === 'Co-Owner' ? '0,245,255' : '168,85,247'},.15)`;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    BATTLE<span style={{ fontSize: '10px', color: 'var(--success)' }}>🟢 LIVE</span>
                </div>
                <div className="staff-badge">STAFF PANEL</div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">MAIN</div>
                <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} end>
                    <span className="s-icon">🏠</span> Dashboard
                </NavLink>
                <NavLink to="/new-session" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="s-icon">➕</span> New Session
                </NavLink>
                <NavLink to="/live" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="s-icon">🔴</span> Live Sessions
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="s-icon">🕐</span> Session History
                </NavLink>

                {role === 'Owner' && (
                    <>
                        <div className="sidebar-section-label" style={{ marginTop: '8px' }}>FINANCE</div>
                        <NavLink to="/expenses" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="s-icon">💸</span> Expenses
                        </NavLink>
                        <NavLink to="/accounts" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="s-icon">🏦</span> Accounts
                        </NavLink>
                        <NavLink to="/revenue" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="s-icon">📈</span> Revenue
                        </NavLink>
                    </>
                )}

                <div className="sidebar-section-label" style={{ marginTop: '8px' }}>PLAYERS</div>
                <NavLink to="/points" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="s-icon">🏆</span> Points
                </NavLink>

                {role === 'Owner' && (
                    <>
                        <div className="sidebar-section-label" style={{ marginTop: '8px' }}>SYSTEM</div>
                        <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="s-icon">⚙️</span> Settings
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    <div className="s-avatar" style={{ background: bg, color: color }}>{initials}</div>
                    <div>
                        <div className="s-name">{activeProfile?.name}</div>
                        <div className="s-role" style={{ color: color }}>{role}</div>
                    </div>
                </div>
                <div onClick={() => setActiveProfile(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,0,110,.2)', background: 'rgba(255,0,110,.04)', transition: 'all .15s' }}>
                    <span style={{ fontSize: '15px' }}>🚪</span>
                    <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '800', color: 'var(--neon2)', letterSpacing: '1px' }}>LOGOUT</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
