import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, User, Settings, ChevronDown, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const ROLE_COLORS = {
    patient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    doctor: 'linear-gradient(135deg, #10b981, #059669)',
    admin: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
};

const ROLE_PATHS = {
    patient: '/patient',
    doctor: '/doctor',
    admin: '/admin',
};

// Master list of all notifications (add new ones here with increasing IDs)
const ALL_NOTIFICATIONS = [
    { id: 1, type: 'appointment', title: 'Appointment Confirmed', body: 'Your appointment has been confirmed.', time: '2m ago' },
    { id: 2, type: 'prescription', title: 'New Prescription', body: 'A new prescription was issued for you.', time: '1h ago' },
    { id: 3, type: 'reminder', title: 'Health Reminder', body: 'Remember to take your daily medication.', time: '3h ago' },
];

// localStorage keys
const STORAGE_DISMISSED = 'medicare_dismissed_notifs';
const STORAGE_READ = 'medicare_read_notifs';

function loadDismissed() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_DISMISSED) || '[]')); }
    catch { return new Set(); }
}

function loadRead() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_READ) || '[]')); }
    catch { return new Set(); }
}

function saveDismissed(set) {
    localStorage.setItem(STORAGE_DISMISSED, JSON.stringify([...set]));
}

function saveRead(set) {
    localStorage.setItem(STORAGE_READ, JSON.stringify([...set]));
}

export default function TopBar({ onMenuClick, title }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    // ── Notification state backed by localStorage ──
    const [dismissed, setDismissed] = useState(loadDismissed);
    const [readIds, setReadIds] = useState(loadRead);

    // Derive visible notifications (not dismissed)
    const notifications = ALL_NOTIFICATIONS.filter(n => !dismissed.has(n.id));

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const avatarBg = ROLE_COLORS[user?.role] || ROLE_COLORS.patient;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = () => {
        const next = new Set([...readIds, ...ALL_NOTIFICATIONS.map(n => n.id)]);
        setReadIds(next);
        saveRead(next);
    };

    const dismissNotif = (id) => {
        const nextDismissed = new Set([...dismissed, id]);
        const nextRead = new Set([...readIds, id]);
        setDismissed(nextDismissed);
        setReadIds(nextRead);
        saveDismissed(nextDismissed);
        saveRead(nextRead);
    };

    const markRead = (id) => {
        if (!readIds.has(id)) {
            const next = new Set([...readIds, id]);
            setReadIds(next);
            saveRead(next);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const goToProfile = () => {
        const path = ROLE_PATHS[user?.role] || '/';
        setShowProfile(false);
        navigate(path);
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="topbar-menu-btn" onClick={onMenuClick}>
                    <Menu size={20} />
                </button>
                <div className="topbar-title">
                    <h1>{title}</h1>
                </div>
            </div>

            <div className="topbar-search">
                <Search size={16} className="topbar-search-icon" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="topbar-search-input"
                />
            </div>

            <div className="topbar-right">
                {/* Notifications */}
                <div className="topbar-dropdown-wrapper" ref={notifRef}>
                    <button
                        className="topbar-icon-btn"
                        title="Notifications"
                        onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="topbar-badge-count">{unreadCount}</span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="topbar-dropdown notif-dropdown">
                            <div className="dropdown-header">
                                <span className="dropdown-title">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span style={{ marginLeft: 6, fontSize: '0.7rem', background: '#eff6ff', color: '#3b82f6', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
                                            {unreadCount} new
                                        </span>
                                    )}
                                </span>
                                {unreadCount > 0 && (
                                    <button className="dropdown-action-btn" onClick={markAllRead}>
                                        <CheckCircle size={13} /> Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <CheckCircle size={28} color="#10b981" style={{ margin: '0 auto 8px' }} />
                                        <p>All caught up!</p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>No notifications</p>
                                    </div>
                                ) : notifications.map(n => {
                                    const isRead = readIds.has(n.id);
                                    return (
                                        <div
                                            key={n.id}
                                            className={`notif-item ${isRead ? 'read' : 'unread'}`}
                                            onClick={() => markRead(n.id)}
                                        >
                                            <div className="notif-dot" />
                                            <div className="notif-body">
                                                <div className="notif-item-title">{n.title}</div>
                                                <div className="notif-item-text">{n.body}</div>
                                                <div className="notif-item-time">{n.time}</div>
                                            </div>
                                            <button
                                                className="notif-dismiss"
                                                title="Dismiss forever"
                                                onClick={e => { e.stopPropagation(); dismissNotif(n.id); }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Avatar */}
                <div className="topbar-dropdown-wrapper" ref={profileRef}>
                    <button
                        className="topbar-profile-btn"
                        onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
                    >
                        <div className="topbar-avatar" style={{ background: avatarBg }}>
                            {initials}
                        </div>
                        <div className="topbar-profile-info">
                            <span className="topbar-profile-name">{user?.name || 'User'}</span>
                            <span className="topbar-profile-role">{user?.role}</span>
                        </div>
                        <ChevronDown size={14} className={`topbar-chevron ${showProfile ? 'rotated' : ''}`} />
                    </button>

                    {showProfile && (
                        <div className="topbar-dropdown profile-dropdown">
                            <div className="dropdown-header" style={{ gap: 12 }}>
                                <div className="profile-header-avatar" style={{ background: avatarBg }}>
                                    {initials}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="profile-header-name">{user?.name}</div>
                                    <div className="profile-header-email">{user?.email}</div>
                                </div>
                            </div>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item" onClick={goToProfile}>
                                <User size={15} /> My Dashboard
                            </button>
                            <button className="dropdown-item" onClick={() => setShowProfile(false)}>
                                <Settings size={15} /> Settings
                            </button>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item danger" onClick={handleLogout}>
                                <LogOut size={15} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
