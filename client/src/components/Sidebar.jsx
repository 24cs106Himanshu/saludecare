import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Calendar, FileText, ClipboardList,
    Users, Settings, LogOut, Menu, X, Bell, ChevronDown,
    Activity, UserCheck, Shield, Stethoscope, MessageSquare
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = {
    patient: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/patient' },
        { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
        { icon: FileText, label: 'Prescriptions', path: '/patient/prescriptions' },
        { icon: ClipboardList, label: 'Medical Records', path: '/patient/records' },
    ],
    doctor: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
        { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
        { icon: Users, label: 'My Patients', path: '/doctor/patients' },
        { icon: FileText, label: 'Prescriptions', path: '/doctor/prescriptions' },
    ],
    admin: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
        { icon: Activity, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
};

const ROLE_COLORS = {
    patient: { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', label: 'Patient' },
    doctor: { bg: 'linear-gradient(135deg, #10b981, #059669)', label: 'Doctor' },
    admin: { bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', label: 'Admin' },
};

export default function Sidebar({ mobileOpen, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const navItems = NAV_ITEMS[user?.role] || [];
    const roleInfo = ROLE_COLORS[user?.role] || ROLE_COLORS.patient;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={onClose} />
            )}

            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Activity size={20} color="white" />
                    </div>
                    <span className="sidebar-logo-text">Medicare</span>
                    <button className="sidebar-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="sidebar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <div className="sidebar-user-avatar" style={{ background: roleInfo.bg }}>
                        {initials}
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{user?.name || 'User'}</span>
                        <span className="sidebar-user-role">{roleInfo.label}</span>
                    </div>
                    <ChevronDown size={14} className={`sidebar-chevron ${showUserMenu ? 'rotated' : ''}`} />
                </div>

                {/* Nav Items */}
                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">Navigation</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                                {isActive && <div className="sidebar-active-dot" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="sidebar-bottom">
                    <button className="sidebar-nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
