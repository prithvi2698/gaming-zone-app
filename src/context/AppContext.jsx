import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';

const AppContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    // PIN session unlocked pages
    const getUnlocked = () => {
        try { return new Set(JSON.parse(sessionStorage.getItem('ba_unlocked') || '[]')); }
        catch { /* ignore */ return new Set(); }
    };
    const [unlockedPages, setUnlockedPages] = useState(getUnlocked());

    const addUnlocked = (page) => {
        const s = new Set(unlockedPages);
        s.add(page);
        setUnlockedPages(s);
        try { sessionStorage.setItem('ba_unlocked', JSON.stringify([...s])); } catch { /* ignore */ }
    };

    // App Settings
    const [appSettings, setAppSettings] = useState({
        arenaName: 'Battle Arena – Kalyan Branch',
        openTime: '10:00',
        closeTime: '23:00',
        staffName: 'Ravi Kumar',
        staffRole: 'Manager',
        pin: '1234',
        recoveryEmail: 'owner@battlearena.com',
        recoveryPhone: '+91 9999999999',
        notifications: { sessionAlerts: true, paymentAlerts: true, dailyReports: false }
    });

    const [staffProfiles, setStaffProfiles] = useState([
        { id: '1', name: 'Battle Arena', role: 'Owner', pin: '1111', is_active: true },
        { id: '2', name: 'Ravi Kumar', role: 'Manager', pin: '1234', is_active: true },
        { id: '3', name: 'Staff Desk', role: 'Staff', pin: '0000', is_active: true }
    ]);
    const [activeProfile, setActiveProfile] = useState(null);

    // Accounts
    const [accountBalances, setAccountBalances] = useState({
        'Cash Register': 0,
        'PhonePe / UPI': 0,
        'HDFC Business': 0
    });

    // Stations
    const [ps5Stations, setPs5Stations] = useState(['PS5 – #01', 'PS5 – #02', 'PS5 – #03', 'PS5 – #04', 'PS5 – #05']);
    const [pcStations, setPcStations] = useState(['PC – #01', 'PC – #02', 'PC – #03', 'PC – #04', 'PC – #05']);

    // Pricing
    const [PS5_RATES, setPS5_RATES] = useState({
        30: { 1: 60, 2: 100, 3: 140, 4: 160 },
        60: { 1: 120, 2: 200, 3: 270, 4: 320 },
        90: { 1: 180, 2: 290, 3: 390, 4: 460 },
        120: { 1: 230, 2: 380, 3: 500, 4: 600 },
        180: { 1: 330, 2: 540, 3: 720, 4: 860 },
        240: { 1: 420, 2: 700, 3: 940, 4: 1120 },
        300: { 1: 500, 2: 840, 3: 1120, 4: 1340 }
    });
    const [PC_RATES, setPC_RATES] = useState({
        30: 50, 60: 100, 90: 140, 120: 180, 180: 260, 240: 320, 300: 380
    });

    // Sessions and History
    const [liveSessions, setLiveSessions] = useState([]);
    const [history, setHistory] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [accountTransactions, setAccountTransactions] = useState([]);

    // Food
    const [foodItems, setFoodItems] = useState([
        { id: 1, name: 'Water', emoji: '💧', price: 20 },
        { id: 2, name: 'Cola', emoji: '🥤', price: 40 },
        { id: 3, name: 'Chips', emoji: '🍟', price: 30 },
        { id: 4, name: 'Burger', emoji: '🍔', price: 80 },
        { id: 5, name: 'Coffee', emoji: '☕', price: 50 },
        { id: 6, name: 'Energy', emoji: '⚡', price: 60 }
    ]);

    // Toast & Notifications
    const [toastMessage, setToastMessage] = useState(null);
    const [toastError, setToastError] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const showToast = useCallback((msg, isError = false) => {
        setToastMessage(msg);
        setToastError(isError);
        setTimeout(() => setToastMessage(null), 2500);
    }, []);

    const pushNotif = useCallback((type, title, msg, sessionId = null) => {
        const n = { id: Date.now() + Math.random(), type, title, msg, sessionId, time: new Date(), unread: true };
        setNotifications(prev => {
            const newNotifs = [n, ...prev];
            if (newNotifs.length > 20) newNotifs.pop();
            return newNotifs;
        });
    }, []);

    // Rate Calculator
    const getRate = useCallback((station, mins, players) => {
        if (!station) return 0;
        if (station.startsWith('PS5')) return PS5_RATES[mins]?.[players] || 0;
        if (station.startsWith('PC')) return PC_RATES[mins] || 0;
        return 0;
    }, [PS5_RATES, PC_RATES]);

    // Initial Supabase Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return; // Silent fallback to local array default if not configured
            try {
                const { data: sessionsData } = await supabase.from('sessions').select('*').eq('status', 'active');
                if (sessionsData) setLiveSessions(sessionsData);

                const { data: historyData } = await supabase.from('history').select('*').order('ended_at', { ascending: false });
                if (historyData) setHistory(historyData);

                const { data: exps } = await supabase.from('expenses').select('*').order('date', { ascending: false });
                if (exps) setExpenses(exps);

                // You can add accounts later when table is defined.
            } catch (err) {
                console.warn("Supabase fetch error, fallback to initial state:", err);
            }
        };
        fetchData();
    }, []);

    // Timer Tick & Alarm Logic
    const alarmedSessionsRef = useRef(new Set());

    useEffect(() => {
        const timer = setInterval(() => {
            setLiveSessions(prev =>
                prev.map(s => {
                    const elapsed = s.elapsedSeconds + 1;
                    const remaining = s.isOpen ? null : (s.bookedSeconds - elapsed);

                    // Sound Alarm exactly when it hits 0
                    if (remaining === 0 && !alarmedSessionsRef.current.has(s.id)) {
                        if (appSettings.notifications.sessionAlerts) {
                            playSound('alarm');
                            pushNotif('alert', 'OVERTIME', `Session ${s.name} on ${s.station} has run out of time!`, s.id);
                        }
                        alarmedSessionsRef.current.add(s.id);
                    }

                    return { ...s, elapsedSeconds: elapsed };
                })
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [appSettings.notifications.sessionAlerts, pushNotif]);

    const value = {
        appSettings, setAppSettings,
        staffProfiles, setStaffProfiles,
        activeProfile, setActiveProfile,
        accountBalances, setAccountBalances,
        ps5Stations, setPs5Stations,
        pcStations, setPcStations,
        PS5_RATES, setPS5_RATES,
        PC_RATES, setPC_RATES,
        liveSessions, setLiveSessions,
        history, setHistory,
        expenses, setExpenses,
        accountTransactions, setAccountTransactions,
        foodItems, setFoodItems,
        unlockedPages, addUnlocked,
        toastMessage, toastError, showToast,
        notifications, setNotifications, pushNotif,
        getRate
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
