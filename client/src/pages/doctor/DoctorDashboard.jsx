import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar, Users, FileText, TrendingUp, Clock,
    CheckCircle, Star, ChevronRight, Activity, RefreshCw,
    User, Stethoscope, AlertCircle
} from 'lucide-react';
import { dashboardAPI, appointmentsAPI } from '../../services/api';
import '../patient/PatientDashboard.css';
import './DoctorDashboard.css';
import toast from 'react-hot-toast';

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, totalAppointments: 0, activePrescriptions: 0 });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            dashboardAPI.getStats(),
            appointmentsAPI.getAll(),
        ]).then(([statsRes, apptRes]) => {
            setStats(statsRes.data);
            const appts = apptRes.data.map((a, i) => ({
                ...a,
                id: a.id || a._id,
                patient: a.patientName || `Patient #${i + 1}`,
                time: a.time || '—',
                type: a.specialty || 'Consultation',
                avatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
            }));
            setAppointments(appts);
        }).catch(() => {
            toast.error('Failed to load dashboard data');
        }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleConfirm = async (id) => {
        setUpdatingId(id);
        try {
            await appointmentsAPI.update(id, { status: 'confirmed' });
            toast.success('Appointment confirmed!');
            fetchData();
        } catch {
            toast.error('Failed to confirm appointment');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleComplete = async (id) => {
        setUpdatingId(id);
        try {
            await appointmentsAPI.update(id, { status: 'completed' });
            toast.success('Appointment marked as completed');
            fetchData();
        } catch {
            toast.error('Failed to update appointment');
        } finally {
            setUpdatingId(null);
        }
    };

    const statusBadge = (status) => {
        const map = {
            completed: 'badge-gray',
            confirmed: 'badge-success',
            pending: 'badge-warning',
            cancelled: 'badge-error',
            rescheduled: 'badge-primary'
        };
        return map[status] || 'badge-primary';
    };

    const recentAppts = appointments.slice(0, 5);
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(a => a.date === todayStr);

    return (
        <DashboardLayout title="Doctor Dashboard">
            <div className="doctor-dashboard">
                {/* Welcome Banner */}
                <div className="doctor-welcome">
                    <div className="doctor-welcome-bg" />
                    <div className="doctor-welcome-content">
                        <div>
                            <h2 className="welcome-title">{getGreeting()}, {user?.name || 'Doctor'} 👨‍⚕️</h2>
                            <p className="welcome-subtitle">
                                You have <strong style={{ color: '#60a5fa' }}>{loading ? '—' : stats.todayAppointments} appointments</strong> scheduled today.
                                {pendingCount > 0 && <span style={{ color: '#fbbf24', marginLeft: 12 }}>⚠️ {pendingCount} pending confirmation</span>}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div className="doctor-welcome-badge">
                                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                                <span>Rating: {user?.rating || 4.9}/5</span>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={fetchData}
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                            >
                                <RefreshCw size={14} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="pd-stats-grid">
                    {[
                        { label: "Today's Appointments", value: loading ? '—' : todayAppts.length, change: 'View schedule', icon: Calendar, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Total Patients', value: loading ? '—' : stats.totalPatients, change: 'All time', icon: Users, color: '#10b981', bg: '#f0fdf4' },
                        { label: 'Active Prescriptions', value: loading ? '—' : stats.activePrescriptions, change: 'This month', icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
                        { label: 'Total Appointments', value: loading ? '—' : stats.totalAppointments, change: 'All time', icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb' },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                                    <Icon size={20} />
                                </div>
                                <div className="stat-card-info">
                                    <div className="stat-card-value">{stat.value}</div>
                                    <div className="stat-card-label">{stat.label}</div>
                                    <div className="stat-card-change">{stat.change}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pd-main-grid">
                    {/* Patient Appointments */}
                    <div className="pd-section">
                        <div className="pd-section-header">
                            <h3 className="pd-section-title">
                                <Stethoscope size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                Recent Patient Appointments
                            </h3>
                            <Link to="/doctor/appointments" className="pd-section-link">
                                Full schedule <ChevronRight size={14} />
                            </Link>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                Loading appointments...
                            </div>
                        ) : recentAppts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
                                <p style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>No appointments yet</p>
                                <p style={{ fontSize: '0.8rem' }}>Patients will appear here when they book with you</p>
                            </div>
                        ) : (
                            <div className="schedule-list">
                                {recentAppts.map(appt => (
                                    <div key={appt.id} className={`schedule-item ${appt.status}`}>
                                        <div className="schedule-time">
                                            <Clock size={12} />
                                            {appt.time}
                                        </div>
                                        <div className="schedule-patient-avatar" style={{ background: appt.avatar }}>
                                            {(appt.patient || 'P')[0].toUpperCase()}
                                        </div>
                                        <div className="schedule-info">
                                            <div className="schedule-patient">{appt.patient}</div>
                                            <div className="schedule-type">{appt.type} • {appt.date || '—'}</div>
                                            {appt.reason && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{appt.reason}</div>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className={`badge ${statusBadge(appt.status)}`}>
                                                {appt.status === 'confirmed' ? '● Confirmed' : appt.status}
                                            </span>
                                            {appt.status === 'pending' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    disabled={updatingId === appt.id}
                                                    onClick={() => handleConfirm(appt.id)}
                                                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                                >
                                                    {updatingId === appt.id ? '...' : 'Confirm'}
                                                </button>
                                            )}
                                            {appt.status === 'confirmed' && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    disabled={updatingId === appt.id}
                                                    onClick={() => handleComplete(appt.id)}
                                                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                                >
                                                    {updatingId === appt.id ? '...' : 'Complete'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions & Stats */}
                    <div className="pd-section">
                        <div className="pd-section-header">
                            <h3 className="pd-section-title">Quick Actions</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'View All Appointments', to: '/doctor/appointments', icon: Calendar, color: '#3b82f6' },
                                { label: 'Patient List', to: '/doctor/patients', icon: Users, color: '#10b981' },
                                { label: 'Manage Prescriptions', to: '/doctor/prescriptions', icon: FileText, color: '#8b5cf6' },
                            ].map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <Link key={i} to={action.to} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '14px 16px', borderRadius: 12,
                                        background: `${action.color}08`,
                                        border: `1px solid ${action.color}20`,
                                        textDecoration: 'none', color: '#1e293b',
                                        fontWeight: 600, fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={18} />
                                        </div>
                                        {action.label}
                                        <ChevronRight size={16} color={action.color} style={{ marginLeft: 'auto' }} />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Doctor Profile Info */}
                        <div style={{ marginTop: 20, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Your Profile
                            </div>
                            <div className="doctor-quick-stats">
                                <div className="dqs-item">
                                    <Activity size={16} color="#3b82f6" />
                                    <div>
                                        <div className="dqs-value">{user?.experience || '8 yrs'}</div>
                                        <div className="dqs-label">Experience</div>
                                    </div>
                                </div>
                                <div className="dqs-item">
                                    <Star size={16} color="#f59e0b" />
                                    <div>
                                        <div className="dqs-value">{user?.rating || 4.9}</div>
                                        <div className="dqs-label">Rating</div>
                                    </div>
                                </div>
                                <div className="dqs-item">
                                    <CheckCircle size={16} color="#10b981" />
                                    <div>
                                        <div className="dqs-value">{loading ? '—' : stats.totalPatients}</div>
                                        <div className="dqs-label">Patients</div>
                                    </div>
                                </div>
                            </div>
                            {user?.specialization && (
                                <div style={{ marginTop: 12, padding: '8px 12px', background: '#eff6ff', borderRadius: 8, fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Stethoscope size={14} />
                                    {user.specialization}
                                </div>
                            )}
                        </div>

                        {/* Today's schedule highlight */}
                        {todayAppts.length > 0 && (
                            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <AlertCircle size={16} color="#d97706" />
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e' }}>Today's Schedule</span>
                                </div>
                                {todayAppts.slice(0, 3).map((a, i) => (
                                    <div key={i} style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: 4 }}>
                                        • {a.time} — {a.patient} <span style={{ color: '#b45309' }}>({a.status})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
