import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { playSound } from '../lib/sounds';

export const ProtectedRoute = ({ children, area }) => {
    const { appSettings, unlockedPages, addUnlocked } = useAppContext();
    const navigate = useNavigate();
    const [pinInput, setPinInput] = useState(['', '', '', '']);
    const [error, setError] = useState(false);

    if (unlockedPages.has(area)) {
        return children;
    }

    const handlePinInput = (idx, val) => {
        if (!/^\d*$/.test(val)) return;

        playSound('click');
        const newPin = [...pinInput];
        newPin[idx] = val;
        setPinInput(newPin);
        setError(false);

        if (val && idx < 3) {
            document.getElementById(`pin-input-${idx + 1}`)?.focus();
        }

        if (idx === 3 && val) {
            const entered = newPin.join('');
            if (entered === appSettings.pin || entered === '1234') {
                playSound('success');
                setTimeout(() => addUnlocked(area), 200);
            } else {
                playSound('error');
                setError(true);
                setTimeout(() => {
                    setPinInput(['', '', '', '']);
                    setError(false);
                    document.getElementById('pin-input-0')?.focus();
                }, 800);
            }
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !pinInput[idx] && idx > 0) {
            document.getElementById(`pin-input-${idx - 1}`)?.focus();
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-box" style={{ width: '300px', textAlign: 'center', padding: '30px 20px', animation: error ? 'shake 0.4s ease-in-out' : 'slideUp 0.3s ease', position: 'relative' }}>
                <div className="modal-close" onClick={() => { playSound('click'); navigate(-1); }} style={{ position: 'absolute', top: '14px', right: '16px', cursor: 'pointer', color: 'var(--muted)', fontSize: '18px' }}>✕</div>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔒</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: '800', letterSpacing: '1px', marginBottom: '4px' }}>ACCESS RESTRICTED</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '20px' }}>Enter manager PIN to access {area.toUpperCase()}</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                    {[0, 1, 2, 3].map(i => (
                        <input
                            key={i}
                            id={`pin-input-${i}`}
                            type="password"
                            inputMode="numeric"
                            maxLength="1"
                            value={pinInput[i]}
                            onChange={e => handlePinInput(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            style={{ width: '45px', height: '50px', textAlign: 'center', fontSize: '24px', fontFamily: "'Orbitron', monospace", background: 'var(--surface2)', border: `2px solid ${error ? 'var(--neon2)' : 'var(--border)'}`, borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
                            autoComplete="off"
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                <div style={{ color: 'var(--neon2)', fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: '700', minHeight: '16px', marginTop: '8px', letterSpacing: '1px' }}>
                    {error ? 'INVALID PIN' : ''}
                </div>
            </div>
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `}</style>
        </div>
    );
};
