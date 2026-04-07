import React, { useState, useEffect } from 'react';
import { Monitor, Gamepad2, Settings, Power } from 'lucide-react';
import Card from './ui/Card';
import './DeviceCard.css';

const DeviceCard = ({ device, onStartSession }) => {
    const { name, type, status, activeSession } = device;
    const [elapsed, setElapsed] = useState('');

    const calculateTimeDiff = (start, end) => {
        const s = Math.floor((end - start) / 1000);
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Status mapping to colors
    const statusColors = {
        available: 'var(--accent-green)',
        in_use: 'var(--accent-red)',
        maintenance: 'var(--accent-amber)',
        offline: 'var(--text-muted)'
    };

    const statusColor = statusColors[status];

    // Dummy timer logic for display
    useEffect(() => {
        if (status !== 'in_use' || !activeSession) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setElapsed('');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(activeSession.startTime);
            const diffStr = calculateTimeDiff(start, now);
            setElapsed(diffStr);
        }, 1000);

        return () => clearInterval(interval);
    }, [status, activeSession]);

    return (
        <Card className={`device-card status-${status}`}>
            <div className="device-header">
                <div className="device-icon" style={{ color: statusColor }}>
                    {type === 'pc' ? <Monitor size={28} /> : <Gamepad2 size={28} />}
                </div>
                <div className="device-id-badge">{name}</div>
            </div>

            <div className="device-body">
                <h3 className="device-status" style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}80` }}>
                    {status.replace('_', ' ').toUpperCase()}
                </h3>

                {status === 'in_use' && activeSession ? (
                    <div className="session-info relative-z">
                        <div className="timer">{elapsed || '00:00:00'}</div>
                        <div className="user">{activeSession.user}</div>
                    </div>
                ) : (
                    <div className="session-empty"></div>
                )}
            </div>

            <div className="device-actions">
                {status === 'available' ? (
                    <button className="action-btn start" onClick={() => onStartSession(device)}>
                        <Power size={18} /> Start
                    </button>
                ) : status === 'in_use' ? (
                    <button className="action-btn stop" onClick={() => onStartSession(device)}>
                        <Power size={18} /> End
                    </button>
                ) : (
                    <button className="action-btn settings">
                        <Settings size={18} />
                    </button>
                )}
            </div>
        </Card>
    );
};

export default DeviceCard;
