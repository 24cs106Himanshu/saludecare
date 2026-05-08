import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, Clock, CheckCircle, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '../../services/api';
import '../patient/PatientDashboard.css';
import '../patient/AppointmentPage.css';

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0d9488'];

export default function DoctorAppointments() {
    const [filter, setFilter] = useState('all');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const fetchAppointments = () => {
        setLoading(true);
        appointmentsAPI.getAll()
            .then(res => {
                const normalized = res.data.map((a, i) => ({
                    ...a,
                    id: a.id || a._id,
                    patient: a.patientName || `Patient #${i + 1}`,
                    age: a.patientAge || '—',
                    date: a.date
                        ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—',
                    time: a.time || '—',
                    type: a.type || 'Consultation',
                    status: a.status || 'pending',
                    avatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    reason: a.reason || '—',
                }));
                setAppointments(normalized);
            })
            .catch(() => toast.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAppointments(); }, []);

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            if (status === 'cancelled') {
                await appointmentsAPI.cancel(id);
            } else {
                await appointmentsAPI.update(id, { status });
            }
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            toast.success(`Appointment ${status}`);
        } catch {
            toast.error('Failed to update appointment');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <DashboardLayout title="Appointments">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Summary Cards */}
                <div className="pd-stats-grid">
                    {[
                        { label: 'Total', value: appointments.length, color: '#3b82f6', bg: '#eff6ff', key: 'all' },
                        { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#10b981', bg: '#f0fdf4', key: 'confirmed' },
                        { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#f59e0b', bg: '#fffbeb', key: 'pending' },
                        { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#8b5cf6', bg: '#f5f3ff', key: 'completed' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter(s.key)}>
                            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
                                <Calendar size={20} />
                            </div>
                            <div className="stat-card-info">
                                <div className="stat-card-value">{loading ? '—' : s.value}</div>
                                <div className="stat-card-label">{s.label} Appointments</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter & Refresh */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
                        <button key={f} className={`spec-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchAppointments}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                        Loading appointments...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                        <p>No appointments found</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(appt => (
                                    <tr key={appt.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: appt.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white' }}>
                                                    {(appt.patient || 'P')[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{appt.patient}</div>
                                                    {appt.age !== '—' && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Age {appt.age}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{appt.date}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} color="#94a3b8" /> {appt.time}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-primary">{appt.type}</span></td>
                                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.reason}</td>
                                        <td>
                                            <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' : appt.status === 'pending' ? 'badge-warning' : appt.status === 'completed' ? 'badge-gray' : 'badge-error'}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {appt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            disabled={updating === appt.id}
                                                            onClick={() => updateStatus(appt.id, 'confirmed')}
                                                        >
                                                            <CheckCircle size={12} /> Accept
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            disabled={updating === appt.id}
                                                            onClick={() => updateStatus(appt.id, 'cancelled')}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </>
                                                )}
                                                {appt.status === 'confirmed' && (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        disabled={updating === appt.id}
                                                        onClick={() => updateStatus(appt.id, 'completed')}
                                                    >
                                                        <CheckCircle size={12} /> Complete
                                                    </button>
                                                )}
                                                {(appt.status === 'completed' || appt.status === 'cancelled') && (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
