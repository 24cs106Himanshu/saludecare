import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, Clock, CheckCircle, X, RefreshCw, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsAPI, doctorsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../patient/PatientDashboard.css';
import '../patient/AppointmentPage.css';

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0d9488'];
const ALL_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
];

export default function DoctorAppointments() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('appointments');
    const [filter, setFilter] = useState('all');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    // Availability state
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [savingAvail, setSavingAvail] = useState(false);

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

    const fetchAvailability = () => {
        if (!user?.id) return;
        setLoadingAvail(true);
        doctorsAPI.getAvailability(user.id)
            .then(res => {
                const blocked = res.data.filter(s => !s.available).map(s => s.time);
                setBlockedSlots(blocked);
            })
            .catch(() => setBlockedSlots([]))
            .finally(() => setLoadingAvail(false));
    };

    useEffect(() => { fetchAppointments(); }, []);
    useEffect(() => { if (activeTab === 'availability') fetchAvailability(); }, [activeTab]);

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

    const toggleSlot = (slot) => {
        setBlockedSlots(prev =>
            prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
        );
    };

    const saveAvailability = async () => {
        if (!user?.id) return;
        setSavingAvail(true);
        try {
            await doctorsAPI.updateAvailability(user.id, blockedSlots);
            toast.success('Availability saved successfully!');
        } catch {
            toast.error('Failed to save availability');
        } finally {
            setSavingAvail(false);
        }
    };

    return (
        <DashboardLayout title="Appointments">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
                    <button
                        onClick={() => setActiveTab('appointments')}
                        style={{
                            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'appointments' ? '#3b82f6' : '#64748b',
                            borderBottom: activeTab === 'appointments' ? '2px solid #3b82f6' : '2px solid transparent',
                            marginBottom: -2, transition: 'all 0.2s',
                        }}
                    >
                        <Calendar size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Appointments
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        style={{
                            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.9rem', color: activeTab === 'availability' ? '#10b981' : '#64748b',
                            borderBottom: activeTab === 'availability' ? '2px solid #10b981' : '2px solid transparent',
                            marginBottom: -2, transition: 'all 0.2s',
                        }}
                    >
                        <Clock size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Manage Availability
                    </button>
                </div>

                {/* ── APPOINTMENTS TAB ── */}
                {activeTab === 'appointments' && (
                    <>
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
                                                                <button className="btn btn-primary btn-sm" disabled={updating === appt.id} onClick={() => updateStatus(appt.id, 'confirmed')}>
                                                                    <CheckCircle size={12} /> Accept
                                                                </button>
                                                                <button className="btn btn-danger btn-sm" disabled={updating === appt.id} onClick={() => updateStatus(appt.id, 'cancelled')}>
                                                                    <X size={12} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {appt.status === 'confirmed' && (
                                                            <button className="btn btn-ghost btn-sm" disabled={updating === appt.id} onClick={() => updateStatus(appt.id, 'completed')}>
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
                    </>
                )}

                {/* ── AVAILABILITY TAB ── */}
                {activeTab === 'availability' && (
                    <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Your Time Slots</h3>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
                                    Toggle slots to mark them as <strong style={{ color: '#10b981' }}>Available</strong> or <strong style={{ color: '#ef4444' }}>Blocked</strong>. Patients cannot book blocked slots.
                                </p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={saveAvailability}
                                disabled={savingAvail}
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                {savingAvail ? <><div className="spinner" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>

                        {loadingAvail ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                Loading availability...
                            </div>
                        ) : (
                            <>
                                {/* Morning */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        🌅 Morning Sessions
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                                        {ALL_SLOTS.filter(s => s.includes('AM')).map(slot => {
                                            const isBlocked = blockedSlots.includes(slot);
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => toggleSlot(slot)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
                                                        fontSize: '0.875rem', border: `2px solid ${isBlocked ? '#fecaca' : '#bbf7d0'}`,
                                                        background: isBlocked ? '#fff5f5' : '#f0fdf4',
                                                        color: isBlocked ? '#ef4444' : '#10b981',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <span><Clock size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />{slot}</span>
                                                    {isBlocked
                                                        ? <><ToggleLeft size={22} /><span style={{ fontSize: '0.7rem', marginLeft: 4 }}>Blocked</span></>
                                                        : <><ToggleRight size={22} /><span style={{ fontSize: '0.7rem', marginLeft: 4 }}>Open</span></>
                                                    }
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Afternoon */}
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        🌇 Afternoon Sessions
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                                        {ALL_SLOTS.filter(s => s.includes('PM')).map(slot => {
                                            const isBlocked = blockedSlots.includes(slot);
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => toggleSlot(slot)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
                                                        fontSize: '0.875rem', border: `2px solid ${isBlocked ? '#fecaca' : '#bbf7d0'}`,
                                                        background: isBlocked ? '#fff5f5' : '#f0fdf4',
                                                        color: isBlocked ? '#ef4444' : '#10b981',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <span><Clock size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />{slot}</span>
                                                    {isBlocked
                                                        ? <><ToggleLeft size={22} /><span style={{ fontSize: '0.7rem', marginLeft: 4 }}>Blocked</span></>
                                                        : <><ToggleRight size={22} /><span style={{ fontSize: '0.7rem', marginLeft: 4 }}>Open</span></>
                                                    }
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={{ marginTop: 24, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }} />
                                        <strong>Open</strong> — Patients can book this slot
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444' }} />
                                        <strong>Blocked</strong> — Slot is hidden from patients
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
