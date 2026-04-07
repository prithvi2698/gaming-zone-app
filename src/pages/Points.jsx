import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Points = () => {
    const { history } = useAppContext();
    const [period, setPeriod] = useState('month');

    const getRankings = () => {
        let filtered = history || [];
        const now = new Date();

        if (period === 'week') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(s => new Date(s.ended_at) >= oneWeekAgo);
        } else if (period === 'month') {
            const currentMonth = now.toISOString().slice(0, 7);
            filtered = filtered.filter(s => (s.ended_at || '').startsWith(currentMonth));
        }

        const ptsMap = {};

        filtered.forEach(s => {
            if (!s.name) return;
            const key = s.name.trim().toLowerCase();
            const points = Math.floor((s.finalAmountPaid || 0) / 100);
            if (!ptsMap[key]) {
                ptsMap[key] = { name: s.name, points: 0, mostPlayed: {} };
            }
            ptsMap[key].points += points;

            const g = s.station.startsWith('PS5') ? 'PS5' : 'PC';
            ptsMap[key].mostPlayed[g] = (ptsMap[key].mostPlayed[g] || 0) + 1;
        });

        return Object.values(ptsMap)
            .filter(u => u.points > 0)
            .sort((a, b) => b.points - a.points)
            .map(u => {
                const fav = Object.keys(u.mostPlayed).sort((x, y) => u.mostPlayed[y] - u.mostPlayed[x])[0];
                return { ...u, game: fav === 'PS5' ? '🎮 Console Gamer' : '💻 PC Gamer' };
            });
    };

    const rankings = getRankings();
    const maxPoints = rankings.length > 0 ? rankings[0].points : 1;

    // Podium splits
    const podium = rankings.slice(0, 3);
    const p1 = podium.length > 0 ? podium[0] : null;
    const p2 = podium.length > 1 ? podium[1] : null;
    const p3 = podium.length > 2 ? podium[2] : null;

    const rest = rankings.slice(3);

    return (
        <div className="page active" id="page-points" style={{ animation: 'fadeIn .2s ease' }}>
            <div className="page-header"><h2>POINTS</h2></div>

            <div className="filter-chips" id="points-chips" style={{ padding: '0 16px 14px' }}>
                <div className={`chip ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>This Month</div>
                <div className={`chip ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>This Week</div>
                <div className={`chip ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>All Time</div>
            </div>

            {rankings.length === 0 ? (
                <div className="empty-state">
                    <div className="es-icon">🏆</div>
                    <div className="es-title">NO RANKINGS YET</div>
                    <div className="es-sub">₹100 spent = 1 point · Points earned when sessions end</div>
                </div>
            ) : (
                <>
                    <div className="podium">
                        {p2 && (
                            <div className="podium-item p2">
                                <div className="podium-avatar">{p2.name.substring(0, 2).toUpperCase()}</div>
                                <div className="podium-bar"></div>
                                <div className="podium-name">{p2.name}</div>
                                <div className="podium-pts">{p2.points} PTS</div>
                            </div>
                        )}
                        {p1 && (
                            <div className="podium-item p1">
                                <span className="crown">👑</span>
                                <div className="podium-avatar">{p1.name.substring(0, 2).toUpperCase()}</div>
                                <div className="podium-bar"></div>
                                <div className="podium-name">{p1.name}</div>
                                <div className="podium-pts">{p1.points} PTS</div>
                            </div>
                        )}
                        {p3 && (
                            <div className="podium-item p3">
                                <div className="podium-avatar">{p3.name.substring(0, 2).toUpperCase()}</div>
                                <div className="podium-bar"></div>
                                <div className="podium-name">{p3.name}</div>
                                <div className="podium-pts">{p3.points} PTS</div>
                            </div>
                        )}
                    </div>

                    {rest.length > 0 && (
                        <>
                            <div className="section-title">FULL RANKINGS</div>
                            <div className="lb-list">
                                {rest.map((r, i) => {
                                    const rank = i + 4;
                                    const pct = Math.max(10, (r.points / maxPoints) * 100);
                                    return (
                                        <div key={i} className="lb-item">
                                            <div className="lb-rank">#{rank}</div>
                                            <div className="lb-ava" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                                                {r.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="lb-info">
                                                <div className="lb-name">{r.name}</div>
                                                <div className="lb-game">{r.game}</div>
                                                <div className="lb-bar-bg"><div className="lb-bar" style={{ width: `${pct}%` }}></div></div>
                                            </div>
                                            <div className="lb-pts">{r.points} PTS</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Points;
