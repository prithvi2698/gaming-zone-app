import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';

const Layout = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar />
            <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
            <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <div className="main-area">
                <Header drawerOpen={drawerOpen} onToggleDrawer={() => setDrawerOpen(!drawerOpen)} />
                <div className="content">
                    {children}
                </div>
                <BottomNav />
            </div>

            {/* Global Modals could be placed here later */}
        </div>
    );
};

export default Layout;
