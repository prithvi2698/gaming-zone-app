import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const BottomNav = () => {
    const { liveSessions } = useAppContext();
    const hasLive = liveSessions.length > 0;

    return (
        <div className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <div className="nav-icon">🏠</div>
                <div className="nav-label">DASHBOARD</div>
            </NavLink>
            <NavLink to="/new-session" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon">➕</div>
                <div className="nav-label">NEW</div>
            </NavLink>
            <NavLink to="/live" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon" style={{ position: 'relative' }}>
                    🔴
                    <div id="nav-live-dot" style={{ display: hasLive ? 'block' : 'none', position: 'absolute', top: '0', right: '-4px', width: '6px', height: '6px', background: 'var(--neon2)', borderRadius: '50%' }}></div>
                </div>
                <div className="nav-label">LIVE</div>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon">🕐</div>
                <div className="nav-label">HISTORY</div>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon">⚙️</div>
                <div className="nav-label">SETTINGS</div>
            </NavLink>
        </div>
    );
};

export default BottomNav;
