import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar, FileText, ClipboardList, Activity, Heart,
    TrendingUp, Clock, ChevronRight, Plus, Star, Pill,
    AlertCircle, CheckCircle, ArrowUpRight
} from 'lucide-react';
import { dashboardAPI, appointmentsAPI, prescriptionsAPI } from '../../services/api';
import './PatientDashboard.css';

const HEALTH_METRICS = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', icon: Activity, color: '#10b981', trend: '+2%' },
    { label: 'Heart Rate', value: '72', unit: 'BPM', status: 'normal', icon: Heart, color: '#ef4444', trend: '-1%' },
    { label: 'Blood Sugar', value: '95', unit: 'mg/dL', status: 'normal', icon: TrendingUp, color: '#f59e0b', trend: '+5%' },
    { label: 'Weight', value: '68', unit: 'kg', status: 'normal', icon: Activity, color: '#8b5cf6', trend: '-0.5%' },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Patient';

    const [stats, setStats] = useState({ totalAppointments: 0, upcomingAppointments: 0, activePrescriptions: 0, medicalRecords: 0 });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            dashboardAPI.getStats(),
            appointmentsAPI.getAll(),
            prescriptionsAPI.getAll(),
        ]).then(([statsRes, apptRes, rxRes]) => {
            setStats(statsRes.data);

            // Upcoming = not completed/cancelled
            const upcoming = apptRes.data
                .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
                .slice(0, 3);
            setUpcomingAppointments(upcoming);

            // Recent prescriptions — latest 3
            const rx = rxRes.data.slice(0, 3).map(p => ({
                id: p.id || p._id,
                medicine: p.medicines?.[0] ? `${p.medicines[0].name} ${p.medicines[0].dosage}` : 'Prescription',
                doctor: p.doctorName || p.doctor || 'Doctor',
                date: p.prescribedDate
                    ? new Date(p.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—',
                dosage: p.medicines?.[0]?.frequency || '—',
                status: (p.status || 'Active').toLowerCase(),
            }));
            setRecentPrescriptions(rx);
        }).catch(() => {
            // silently fall back to 0 stats — data shown via links
        }).finally(() => setLoading(false));
    }, []);

    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

    return (
        <DashboardLayout title="Patient Dashboard">
            <div className="patient-dashboard">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-banner-bg" />
                    <div className="welcome-content">
                        <div>
                            <h2 className="welcome-title">{getGreeting()}, {firstName}! 👋</h2>
                            <p className="welcome-subtitle">Here's your health overview for today.</p>
                        </div>
                        <Link to="/patient/appointments" className="btn btn-primary">
                            <Plus size={16} />
                            Book Appointment
                        </Link>
                    </div>
                    <div className="welcome-stats">
                        <div className="welcome-stat">
                            <Calendar size={18} color="#60a5fa" />
                            <div>
                                <div className="welcome-stat-value">{loading ? '—' : stats.upcomingAppointments ?? upcomingAppointments.length}</div>
                                <div className="welcome-stat-label">Upcoming</div>
                            </div>
                        </div>
                        <div className="welcome-stat-divider" />
                        <div className="welcome-stat">
                            <Pill size={18} color="#34d399" />
                            <div>
                                <div className="welcome-stat-value">{loading ? '—' : stats.activePrescriptions ?? 0}</div>
                                <div className="welcome-stat-label">Active Rx</div>
                            </div>
                        </div>
                        <div className="welcome-stat-divider" />
                        <div className="welcome-stat">
                            <ClipboardList size={18} color="#a78bfa" />
                            <div>
                                <div className="welcome-stat-value">{loading ? '—' : stats.medicalRecords ?? 0}</div>
                                <div className="welcome-stat-label">Records</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="pd-stats-grid">
                    {[
                        { label: 'Total Appointments', value: loading ? '—' : stats.totalAppointments ?? 0, change: 'View all →', icon: Calendar, color: '#3b82f6', bg: '#eff6ff', path: '/patient/appointments' },
                        { label: 'Active Prescriptions', value: loading ? '—' : stats.activePrescriptions ?? 0, change: 'View prescriptions →', icon: Pill, color: '#10b981', bg: '#f0fdf4', path: '/patient/prescriptions' },
                        { label: 'Medical Records', value: loading ? '—' : stats.medicalRecords ?? 0, change: 'View records →', icon: ClipboardList, color: '#8b5cf6', bg: '#f5f3ff', path: '/patient/records' },
                        { label: 'Upcoming Appointments', value: loading ? '—' : stats.upcomingAppointments ?? upcomingAppointments.length, change: 'Book now →', icon: Clock, color: '#f59e0b', bg: '#fffbeb', path: '/patient/appointments' },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 80}ms`, cursor: 'pointer' }} onClick={() => navigate(stat.path)}>
                                <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                                    <Icon size={20} />
                                </div>
                                <div className="stat-card-info">
                                    <div className="stat-card-value">{stat.value}</div>
                                    <div className="stat-card-label">{stat.label}</div>
                                    <div className="stat-card-change" style={{ color: stat.color }}>{stat.change}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pd-main-grid">
                    {/* Upcoming Appointments */}
                    <div className="pd-section">
                        <div className="pd-section-header">
                            <h3 className="pd-section-title">Upcoming Appointments</h3>
                            <Link to="/patient/appointments" className="pd-section-link">
                                View all <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="appointments-list">
                            {upcomingAppointments.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                    <Calendar size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontSize: '0.85rem' }}>No upcoming appointments</p>
                                    <Link to="/patient/appointments" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                                        Book Now
                                    </Link>
                                </div>
                            )}
                            {upcomingAppointments.map((appt, i) => (
                                <div key={appt.id || appt._id} className="appointment-item">
                                    <div className="appt-avatar" style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                                        {(appt.doctorName || 'D')[0]}
                                    </div>
                                    <div className="appt-info">
                                        <div className="appt-doctor">{appt.doctorName || 'Doctor'}</div>
                                        <div className="appt-specialty">{appt.specialty || '—'}</div>
                                        <div className="appt-time">
                                            <Calendar size={12} />
                                            {appt.date ? new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} • {appt.time || '—'}
                                        </div>
                                    </div>
                                    <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                        {appt.status === 'confirmed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                        {appt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Health Metrics */}
                    <div className="pd-section">
                        <div className="pd-section-header">
                            <h3 className="pd-section-title">Health Metrics</h3>
                            <span className="pd-section-link">Last updated today</span>
                        </div>
                        <div className="health-metrics-grid">
                            {HEALTH_METRICS.map((metric, i) => {
                                const Icon = metric.icon;
                                return (
                                    <div key={i} className="health-metric-card">
                                        <div className="hm-icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="hm-value">{metric.value} <span className="hm-unit">{metric.unit}</span></div>
                                        <div className="hm-label">{metric.label}</div>
                                        <div className={`hm-trend ${metric.trend.startsWith('+') ? 'up' : 'down'}`}>
                                            <ArrowUpRight size={10} />
                                            {metric.trend}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Prescriptions */}
                <div className="pd-section">
                    <div className="pd-section-header">
                        <h3 className="pd-section-title">Recent Prescriptions</h3>
                        <Link to="/patient/prescriptions" className="pd-section-link">
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    {recentPrescriptions.length === 0 && !loading ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                            <Pill size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '0.85rem' }}>No prescriptions yet</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Prescribed By</th>
                                        <th>Dosage</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPrescriptions.map(rx => (
                                        <tr key={rx.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Pill size={14} color="#3b82f6" />
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{rx.medicine}</span>
                                                </div>
                                            </td>
                                            <td>{rx.doctor}</td>
                                            <td>{rx.dosage}</td>
                                            <td>{rx.date}</td>
                                            <td>
                                                <span className={`badge ${rx.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                                                    {rx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Alert */}
                <div className="pd-alert">
                    <AlertCircle size={18} color="#f59e0b" />
                    <div>
                        <strong>Health Tip:</strong> Stay hydrated and take your medications on time for better health outcomes.
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>Dismiss</button>
                </div>
            </div>
        </DashboardLayout>
    );
}
