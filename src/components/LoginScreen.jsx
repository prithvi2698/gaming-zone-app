import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { playSound } from '../lib/sounds';
import './LoginScreen.css';

const LoginScreen = () => {
    const { appSettings, staffProfiles, setActiveProfile, getLogoParts } = useAppContext();
    const [step, setStep] = useState('profiles'); // 'profiles' or 'pin'
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [pinInput, setPinInput] = useState(['', '', '', '']);
    const [error, setError] = useState(false);

    // Focus first input when PIN step mounts
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        if (step === 'pin') {
            setTimeout(() => inputRefs[0].current?.focus(), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        setStep('pin');
        setPinInput(['', '', '', '']);
        setError(false);
    };

    const handlePinInput = (idx, val) => {
        if (!/^\d*$/.test(val)) return;
        playSound('click');

        const newPin = [...pinInput];
        newPin[idx] = val;
        setPinInput(newPin);
        setError(false);

        if (val && idx < 3) {
            inputRefs[idx + 1].current?.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !pinInput[idx] && idx > 0) {
            inputRefs[idx - 1].current?.focus();
        }
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const entered = pinInput.join('');
        if (entered.length < 4) return;

        if (entered === selectedProfile.pin) {
            playSound('success');
            setTimeout(() => {
                setActiveProfile(selectedProfile);
            }, 300);
        } else {
            playSound('error');
            setError(true);
            setTimeout(() => {
                setPinInput(['', '', '', '']);
                setError(false);
                inputRefs[0].current?.focus();
            }, 800);
        }
    };

    const handleBack = () => {
        setStep('profiles');
        setSelectedProfile(null);
    };

    const getProfileStyles = (role) => {
        const r = role.toLowerCase();
        if (r === 'owner') return { class: 'owner', bg: 'rgba(255,215,0,.15)', text: 'var(--gold)' };
        if (r === 'co-owner') return { class: 'co-owner', bg: 'rgba(0,245,255,.15)', text: 'var(--neon)' };
        return { class: 'staff', bg: 'rgba(168,85,247,.15)', text: 'var(--neon3)' };
    };

    return (
        <div className="login-screen-overlay">
            <div className="ls-modal">
                <div className="ls-modal-header">
                    <div className="ls-logo">{getLogoParts().first}<span>{getLogoParts().rest}</span></div>
                    <div className="ls-sub">{appSettings.arenaName.toUpperCase()} &middot; STAFF PANEL</div>
                </div>

                <div className="ls-modal-body">
                    {step === 'profiles' ? (
                        <>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '700', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '14px', textAlign: 'center' }}>
                                WHO ARE YOU?
                            </div>
                            <div className="ls-profiles">
                                {staffProfiles.filter(p => p.is_active).map(profile => {
                                    const { class: cls, bg, text } = getProfileStyles(profile.role);
                                    const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                    return (
                                        <div key={profile.id} className={`ls-profile-btn ${cls}`} onClick={() => handleProfileSelect(profile)}>
                                            <div className="ls-av" style={{ background: bg, color: text }}>{initials}</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '700' }}>{profile.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{profile.role}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="ls-pin-box">
                            <div style={{ fontSize: '40px', marginBottom: '6px' }}>👤</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '15px', fontWeight: '900', letterSpacing: '1px' }}>{selectedProfile?.name}</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', marginTop: '4px', marginBottom: '4px', color: getProfileStyles(selectedProfile?.role).text }}>{selectedProfile?.role.toUpperCase()}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Enter your PIN to continue</div>

                            <div className="ls-pin-digits" style={{ animation: error ? 'shake 0.4s ease-in-out' : 'none' }}>
                                {[0, 1, 2, 3].map(i => (
                                    <input
                                        key={i}
                                        ref={inputRefs[i]}
                                        className="pin-digit"
                                        maxLength="1"
                                        type="password"
                                        inputMode="numeric"
                                        value={pinInput[i]}
                                        onChange={e => handlePinInput(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        style={{ borderColor: error ? 'var(--neon2)' : '' }}
                                        autoComplete="off"
                                    />
                                ))}
                            </div>

                            <div className="ls-error">{error ? 'INCORRECT PIN' : ''}</div>

                            <button onClick={handleSubmit} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--neon), var(--neon3))', border: 'none', borderRadius: '13px', color: '#000', fontFamily: "'Orbitron', monospace", fontSize: '12px', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}>
                                ▶ ENTER
                            </button>
                            <div className="ls-back" onClick={handleBack}>← Back to profiles</div>
                        </div>
                    )}
                </div>
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px); }
                        75% { transform: translateX(10px); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default LoginScreen;
