import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MOCK_USERS = [
    { id: 1, handle: 'Alex.K', name: 'Alex Knight', tier: 'Gold', balance: 45.50, hoursPlayed: 120 },
    { id: 2, handle: 'Guest_910', name: 'Walk-In', tier: 'Standard', balance: 0.00, hoursPlayed: 2 },
    { id: 3, handle: 'Sarah_V', name: 'Sarah Vance', tier: 'Platinum', balance: 150.00, hoursPlayed: 450 },
];

const Users = () => {
    const [users] = useState(MOCK_USERS);

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Platinum': return 'var(--accent-cyan)';
            case 'Gold': return 'var(--accent-amber)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Membership Profiles</h2>
                <Button variant="primary">+ Register User</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {users.map(user => (
                    <Card key={user.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.handle}</h3>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.name}</span>
                            </div>
                            <div style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: getTierColor(user.tier)
                            }}>
                                {user.tier}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Account Balance</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                    ${user.balance.toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hours Played</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {user.hoursPlayed}h
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                            <Button variant="secondary" style={{ flex: 1 }}>Top Up</Button>
                            <Button variant="ghost" style={{ flex: 1 }}>Edit</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Users;
