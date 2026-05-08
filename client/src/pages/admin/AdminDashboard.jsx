import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Users, Stethoscope, Calendar, TrendingUp, Activity,
    Shield, AlertCircle, CheckCircle, Clock, ArrowUpRight,
    ArrowDownRight, Eye, Trash2, UserPlus, BarChart2,
    DollarSign, Star, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardAPI, patientsAPI } from '../../services/api';
import './AdminDashboard.css';

const STATS = [
    { label: 'Total Users', value: '12,480', change: '+8.2%', up: true, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active Doctors', value: '214', change: '+3.1%', up: true, icon: Stethoscope, color: '#10b981', bg: '#f0fdf4' },
    { label: 'Appointments Today', value: '1,042', change: '+12.5%', up: true, icon: Calendar, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Revenue (Feb)', value: '$84,200', change: '-2.1%', up: false, icon: DollarSign, color: '#f59e0b', bg: '#fffbeb' },
];

const RECENT_USERS = [
    { id: 1, name: 'Alex Johnson', email: 'alex@email.com', role: 'patient', joined: 'Feb 18', status: 'active', avatar: '#3b82f6' },
    { id: 2, name: 'Dr. Sarah Mitchell', email: 'sarah@medicare.com', role: 'doctor', joined: 'Feb 17', status: 'active', avatar: '#10b981' },
    { id: 3, name: 'Maria Garcia', email: 'maria@email.com', role: 'patient', joined: 'Feb 16', status: 'active', avatar: '#8b5cf6' },
    { id: 4, name: 'Dr. James Wilson', email: 'james@medicare.com', role: 'doctor', joined: 'Feb 15', status: 'pending', avatar: '#f59e0b' },
    { id: 5, name: 'Robert Lee', email: 'robert@email.com', role: 'patient', joined: 'Feb 14', status: 'active', avatar: '#ef4444' },
    { id: 6, name: 'Emily Chen', email: 'emily@email.com', role: 'patient', joined: 'Feb 13', status: 'suspended', avatar: '#0d9488' },
];

const TOP_DOCTORS = [
    { name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', patients: 1240, rating: 4.9, revenue: '$12,400', color: '#3b82f6' },
    { name: 'Dr. Priya Sharma', specialty: 'Pediatrician', patients: 1560, rating: 4.9, revenue: '$15,600', color: '#10b981' },
    { name: 'Dr. James Wilson', specialty: 'Neurologist', patients: 980, rating: 4.8, revenue: '$9,800', color: '#8b5cf6' },
    { name: 'Dr. Robert Chen', specialty: 'Orthopedist', patients: 870, rating: 4.7, revenue: '$8,700', color: '#f59e0b' },
];

const SYSTEM_ALERTS = [
    { type: 'warning', msg: 'Server load at 78% — consider scaling', time: '5 min ago' },
    { type: 'info', msg: '3 new doctor registrations pending approval', time: '1 hr ago' },
    { type: 'success', msg: 'Database backup completed successfully', time: '3 hrs ago' },
    { type: 'error', msg: 'Payment gateway timeout — 2 failed transactions', time: '6 hrs ago' },
];

const MONTHLY_DATA = [
    { month: 'Sep', patients: 820, appointments: 1200 },
    { month: 'Oct', patients: 940, appointments: 1380 },
    { month: 'Nov', patients: 880, appointments: 1290 },
    { month: 'Dec', patients: 760, appointments: 1100 },
    { month: 'Jan', patients: 1020, appointments: 1540 },
    { month: 'Feb', patients: 1240, appointments: 1820 },
];

function MiniBarChart({ data }) {
    const maxVal = Math.max(...data.map(d => d.appointments));
    return (
        <div className="mini-bar-chart">
            {data.map((d, i) => (
                <div key={i} className="bar-col">
                    <div className="bar-wrap">
                        <div
                            className="bar-fill"
                            style={{ height: `${(d.appointments / maxVal) * 100}%` }}
                            title={`${d.appointments} appointments`}
                        />
                    </div>
                    <div className="bar-label">{d.month}</div>
                </div>
            ))}
        </div>
    );
}

export default function AdminDashboard() {
    const [users, setUsers] = useState(RECENT_USERS);
    const [activeTab, setActiveTab] = useState('overview');
    const [liveStats, setLiveStats] = useState(null);

    useEffect(() => {
        dashboardAPI.getStats()
            .then(res => setLiveStats(res.data))
            .catch(() => { }); // silently fall back to hardcoded STATS

        patientsAPI.getAll()
            .then(res => {
                if (res.data.length > 0) {
                    const mapped = res.data.map((u, i) => ({
                        id: u.id || u._id || i,
                        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || `User #${i + 1}`,
                        email: u.email || '—',
                        role: u.role || 'patient',
                        joined: u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—',
                        status: u.status || 'active',
                        avatar: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][i % 5],
                    }));
                    setUsers(mapped);
                }
            })
            .catch(() => { });
    }, []);

    // Merge live stats on top of hardcoded STATS array labels
    const displayStats = STATS.map((s, i) => {
        if (!liveStats) return s;
        const overrides = [
            liveStats.totalPatients != null ? String(liveStats.totalPatients) : null,
            liveStats.totalDoctors != null ? String(liveStats.totalDoctors) : null,
            liveStats.todayAppointments != null ? String(liveStats.todayAppointments) : null,
            null, // revenue stays hardcoded
        ];
        return overrides[i] ? { ...s, value: overrides[i] } : s;
    });

    const suspendUser = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u));
        toast.success('User status updated');
    };

    const deleteUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('User removed');
    };

    return (
        <DashboardLayout title="Admin Dashboard">
            <div className="admin-dashboard">
                {/* Welcome */}
                <div className="admin-welcome">
                    <div className="admin-welcome-bg" />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 className="welcome-title">System Overview 🛡️</h2>
                        <p className="welcome-subtitle">Medicare platform is running smoothly. Last updated: Feb 18, 2026 at 11:24 PM</p>
                    </div>
                    <div className="admin-welcome-badges" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="admin-badge">
                            <span className="status-dot online" />
                            <span>All Systems Operational</span>
                        </div>
                        <div className="admin-badge">
                            <Activity size={14} />
                            <span>99.9% Uptime</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="appt-tabs">
                    {['overview', 'users', 'analytics'].map(tab => (
                        <button key={tab} className={`appt-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'overview' && <BarChart2 size={16} />}
                            {tab === 'users' && <Users size={16} />}
                            {tab === 'analytics' && <TrendingUp size={16} />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Stats */}
                        <div className="pd-stats-grid">
                            {displayStats.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                        <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="stat-card-info">
                                            <div className="stat-card-value">{stat.value}</div>
                                            <div className="stat-card-label">{stat.label}</div>
                                            <div className={`admin-stat-change ${stat.up ? 'up' : 'down'}`}>
                                                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {stat.change} vs last month
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="admin-grid-2">
                            {/* Chart */}
                            <div className="pd-section">
                                <div className="pd-section-header">
                                    <h3 className="pd-section-title">Appointments Trend</h3>
                                    <span className="pd-section-link">Last 6 months</span>
                                </div>
                                <MiniBarChart data={MONTHLY_DATA} />
                                <div className="chart-legend">
                                    {MONTHLY_DATA.map((d, i) => (
                                        <div key={i} className="chart-legend-item">
                                            <span style={{ fontWeight: 700 }}>{d.appointments}</span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{d.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* System Alerts */}
                            <div className="pd-section">
                                <div className="pd-section-header">
                                    <h3 className="pd-section-title">System Alerts</h3>
                                    <button className="pd-section-link" onClick={() => toast.success('All alerts cleared')}>Clear all</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {SYSTEM_ALERTS.map((alert, i) => (
                                        <div key={i} className={`system-alert ${alert.type}`}>
                                            {alert.type === 'warning' && <AlertCircle size={16} />}
                                            {alert.type === 'info' && <AlertCircle size={16} />}
                                            {alert.type === 'success' && <CheckCircle size={16} />}
                                            {alert.type === 'error' && <AlertCircle size={16} />}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{alert.msg}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>{alert.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Doctors */}
                        <div className="pd-section">
                            <div className="pd-section-header">
                                <h3 className="pd-section-title">Top Performing Doctors</h3>
                                <span className="pd-section-link">This month</span>
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Doctor</th>
                                            <th>Specialty</th>
                                            <th>Patients</th>
                                            <th>Rating</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TOP_DOCTORS.map((doc, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${doc.color}, ${doc.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>
                                                            {doc.name.split(' ').slice(-1)[0][0]}
                                                        </div>
                                                        <span style={{ fontWeight: 700 }}>{doc.name}</span>
                                                    </div>
                                                </td>
                                                <td>{doc.specialty}</td>
                                                <td><span className="badge badge-primary">{doc.patients.toLocaleString()}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                                        <span style={{ fontWeight: 700 }}>{doc.rating}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 700, color: '#10b981' }}>{doc.revenue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Recent Registrations</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Invite sent!')}>
                                <UserPlus size={14} /> Invite User
                            </button>
                        </div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: user.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>
                                                        {user.name[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.role === 'doctor' ? 'badge-success' : user.role === 'admin' ? 'badge-error' : 'badge-primary'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{user.joined}</td>
                                            <td>
                                                <span className={`badge ${user.status === 'active' ? 'badge-success' : user.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => toast.success('Viewing user...')}><Eye size={13} /></button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => suspendUser(user.id)}>
                                                        <Shield size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)}><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <div className="animate-fade-in admin-analytics">
                        <div className="analytics-grid">
                            {[
                                { label: 'New Patients (Feb)', value: '1,240', change: '+18%', color: '#3b82f6' },
                                { label: 'Appointments (Feb)', value: '1,820', change: '+12%', color: '#10b981' },
                                { label: 'Prescriptions (Feb)', value: '3,140', change: '+9%', color: '#8b5cf6' },
                                { label: 'Avg. Wait Time', value: '12 min', change: '-8%', color: '#f59e0b' },
                                { label: 'Patient Retention', value: '87%', change: '+3%', color: '#0d9488' },
                                { label: 'Doctor Utilization', value: '76%', change: '+5%', color: '#ef4444' },
                            ].map((item, i) => (
                                <div key={i} className="analytics-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                    <div className="analytics-value" style={{ color: item.color }}>{item.value}</div>
                                    <div className="analytics-label">{item.label}</div>
                                    <div className={`analytics-change ${item.change.startsWith('+') ? 'up' : 'down'}`}>
                                        {item.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {item.change} vs Jan
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Specialty Distribution */}
                        <div className="pd-section" style={{ marginTop: 20 }}>
                            <div className="pd-section-header">
                                <h3 className="pd-section-title">Appointments by Specialty</h3>
                            </div>
                            <div className="specialty-bars">
                                {[
                                    { name: 'Cardiology', count: 420, pct: 82, color: '#3b82f6' },
                                    { name: 'Pediatrics', count: 380, pct: 74, color: '#10b981' },
                                    { name: 'Neurology', count: 290, pct: 57, color: '#8b5cf6' },
                                    { name: 'Orthopedics', count: 240, pct: 47, color: '#f59e0b' },
                                    { name: 'Dermatology', count: 190, pct: 37, color: '#ef4444' },
                                    { name: 'Psychiatry', count: 160, pct: 31, color: '#0d9488' },
                                ].map((s, i) => (
                                    <div key={i} className="specialty-bar-row">
                                        <div className="specialty-bar-label">{s.name}</div>
                                        <div className="specialty-bar-track">
                                            <div className="specialty-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                                        </div>
                                        <div className="specialty-bar-count">{s.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
