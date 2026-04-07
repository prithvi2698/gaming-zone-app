import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const History = () => {
    const { history } = useAppContext();
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('today');

    // Filtering logic
    const filterHistory = () => {
        let filtered = history || [];

        // Apply period filter
        if (period !== 'all') {
            const now = new Date();
            const todayStr = now.toISOString().slice(0, 10);

            if (period === 'today') {
                filtered = filtered.filter(s => (s.ended_at || '').startsWith(todayStr));
            } else if (period === 'week') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(s => new Date(s.ended_at) >= oneWeekAgo);
            } else if (period === 'month') {
                const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
                filtered = filtered.filter(s => (s.ended_at || '').startsWith(currentMonth));
            }
        }

        // Apply search filter
        if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(s => (s.name || '').toLowerCase().includes(lowerSearch));
        }

        return filtered;
    };

    const displayData = filterHistory();

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        const d = new Date(isoString);
        let h = d.getHours();
        let m = d.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        m = String(m).padStart(2, '0');
        return `${h}:${m} ${ampm}`;
    };

    return (
        <div className="page active" id="page-history" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header"><h2>SESSION HISTORY</h2></div>

            <div className="search-bar">
                <span>🔍</span>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoComplete="off"
                />
                {search && (
                    <span onClick={() => setSearch('')} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '16px' }}>✕</span>
                )}
            </div>

            <div className="filter-chips" style={{ padding: '0 16px 14px', whiteSpace: 'nowrap' }}>
                {['today', 'week', 'month', 'all'].map(p => (
                    <div
                        key={p}
                        className={`chip ${period === p ? 'active' : ''}`}
                        onClick={() => setPeriod(p)}
                    >
                        {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
                    </div>
                ))}
            </div>

            <div style={{ padding: '0 16px' }}>
                {displayData.length === 0 ? (
                    <div className="empty-state">
                        <div className="es-icon">🎮</div>
                        <div className="es-title">{search ? 'NO RESULTS FOUND' : 'NO SESSIONS TODAY'}</div>
                        <div className="es-sub">{search ? 'Try another search term' : 'Sessions appear here once ended'}</div>
                    </div>
                ) : (
                    displayData.map((session, i) => (
                        <div key={i} className="history-item">
                            <div className="history-top">
                                <div className="history-user">{session.name}</div>
                                <div className="history-amt">₹{session.finalAmountPaid}</div>
                            </div>
                            <div className="history-bottom">
                                <span className="history-tag">
                                    {session.stationIcon} {session.station.replace('PS5 – ', 'PS5 ').replace('PC – ', 'PC ')}
                                </span>
                                <span className="history-tag">
                                    {session.durationLabel}
                                </span>
                                <span className="history-tag">
                                    {formatTime(session.startTime)} - {formatTime(session.ended_at)}
                                </span>
                                <span className="history-tag" style={{ border: '1px solid rgba(0,255,136,.3)', color: 'var(--success)' }}>
                                    {session.finalPaymentMode || 'Cash'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
