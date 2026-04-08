import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const pageTitles = {
    '/': 'DASHBOARD',
    '/new-session': 'NEW SESSION',
    '/live': 'LIVE SESSIONS',
    '/history': 'SESSION HISTORY',
    '/expenses': 'EXPENSES',
    '/accounts': 'ACCOUNTS',
    '/revenue': 'REVENUE',
    '/points': 'POINTS',
    '/settings': 'SETTINGS',
};

const Header = ({ drawerOpen, onToggleDrawer }) => {
    const location = useLocation();
    const title = pageTitles[location.pathname] || '';
    const { notifications, getLogoParts } = useAppContext();
    const hasUnread = notifications.some(n => n.unread);

    return (
        <div className="header">
            <div className="header-left">
                <div className={`hamburger ${drawerOpen ? 'open' : ''}`} onClick={onToggleDrawer}>
                    <span></span><span></span><span></span>
                </div>
                <div className="logo">{getLogoParts().first}<span>{getLogoParts().rest}</span></div>
                <div className="staff-badge">STAFF</div>
            </div>

            <span className="header-page-title">{title}</span>

            <div className="header-right">
                <div className="notif-btn" onClick={() => {/* Toggle notif panel logic later */ }}>
                    🔔
                    {hasUnread && <div className="notif-dot"></div>}
                </div>
            </div>
        </div>
    );
};

export default Header;
