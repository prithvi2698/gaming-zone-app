import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const MobileDrawer = ({ isOpen, onClose }) => {
    const { appSettings } = useAppContext();
    const initials = (appSettings.staffName || 'BA').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
    const role = appSettings.staffRole || 'Staff';

    const roleColors = { 'Owner': 'var(--gold)', 'Co-Owner': 'var(--neon)', 'Staff': 'var(--muted)' };
    const color = roleColors[role] || 'var(--muted)';
    const bg = `rgba(${role === 'Owner' ? '255,215,0' : role === 'Co-Owner' ? '0,245,255' : '168,85,247'},.15)`;

    return (
        <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
            <div className="drawer-logo">
                <div className="logo">BATTLE<span>ARENA</span></div>
                <div className="staff-badge">STAFF PANEL</div>
            </div>

            <nav className="drawer-nav">
                <NavLink to="/" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`} end>
                    <div className="d-icon">🏠</div> Dashboard
                </NavLink>
                <NavLink to="/new-session" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">➕</div> New Session
                </NavLink>
                <NavLink to="/live" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">🔴</div> Live Sessions
                </NavLink>
                <NavLink to="/history" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">🕐</div> Session History
                </NavLink>

                <div className="sidebar-section-label" style={{ marginTop: '12px', paddingLeft: '12px' }}>FINANCE</div>
                <NavLink to="/expenses" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">💸</div> Expenses
                </NavLink>
                <NavLink to="/accounts" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">🏦</div> Accounts
                </NavLink>
                <NavLink to="/revenue" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">📈</div> Revenue
                </NavLink>

                <div className="sidebar-section-label" style={{ marginTop: '12px', paddingLeft: '12px' }}>MORE</div>
                <NavLink to="/points" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">🏆</div> Points
                </NavLink>
                <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `drawer-nav-item ${isActive ? 'active' : ''}`}>
                    <div className="d-icon">⚙️</div> Settings
                </NavLink>
            </nav>

            <div className="drawer-user" style={{ marginTop: 'auto', marginBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="drawer-user-card">
                    <div className="d-avatar" style={{ background: bg, color: color }}>{initials}</div>
                    <div>
                        <div className="d-user-name">{appSettings.staffName}</div>
                        <div className="d-user-role" style={{ color: color }}>{role}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileDrawer;
