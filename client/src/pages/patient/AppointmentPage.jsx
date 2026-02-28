import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, X, CheckCircle, Stethoscope, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsAPI, doctorsAPI } from '../../services/api';
import './AppointmentPage.css';

const TIME_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];
const BOOKED_SLOTS = ['9:30 AM', '11:00 AM', '3:00 PM'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// No fallback doctors; display empty state if none are returned

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0d9488'];

function MiniCalendar({ selectedDate, onSelect }) {
    const [viewDate, setViewDate] = useState(new Date());
    const today = new Date();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="mini-calendar">
            <div className="cal-header">
                <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
                    <ChevronLeft size={16} />
                </button>
                <span className="cal-month-label">{MONTHS[month]} {year}</span>
                <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="cal-days-header">
                {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
            </div>
            <div className="cal-grid">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const date = new Date(year, month, day);
                    const isToday = date.toDateString() === today.toDateString();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    const isPast = date < today && !isToday;
                    return (
                        <button
                            key={i}
                            className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                            onClick={() => !isPast && onSelect(date)}
                            disabled={isPast}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function AppointmentPage() {
    const [activeTab, setActiveTab] = useState('book');
    const [step, setStep] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [reason, setReason] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [filterSpec, setFilterSpec] = useState('All');

    // API state
    const [doctors, setDoctors] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        doctorsAPI.getAll()
            .then(res => {
                const docs = res.data.map((d, i) => ({
                    ...d,
                    name: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
                    specialty: d.specialization || d.specialty || 'General',
                    rating: d.rating || (4.5 + Math.random() * 0.5).toFixed(1),
                    available: true,
                    color: COLORS[i % COLORS.length],
                    hospital: d.hospital || 'Medicare General',
                }));
                setDoctors(docs);
            })
            .catch(() => setDoctors([]))
            .finally(() => setLoadingDoctors(false));
    }, []);

    const fetchAppointments = () => {
        setLoadingAppointments(true);
        appointmentsAPI.getAll()
            .then(res => setMyAppointments(res.data))
            .catch(() => setMyAppointments([]))
            .finally(() => setLoadingAppointments(false));
    };

    useEffect(() => { fetchAppointments(); }, []);

    const specialties = ['All', ...new Set(doctors.map(d => d.specialty))];
    const filteredDoctors = filterSpec === 'All' ? doctors : doctors.filter(d => d.specialty === filterSpec);

    const handleBook = async () => {
        setBooking(true);
        try {
            await appointmentsAPI.create({
                doctorId: selectedDoctor.id,
                doctorName: selectedDoctor.name,
                specialty: selectedDoctor.specialty,
                hospital: selectedDoctor.hospital,
                date: selectedDate?.toISOString().split('T')[0],
                time: selectedSlot,
                reason,
            });
            setShowSuccess(true);
            toast.success('Appointment booked successfully!');
            setTimeout(() => {
                setShowSuccess(false);
                setStep(1);
                setSelectedDoctor(null);
                setSelectedDate(null);
                setSelectedSlot(null);
                setReason('');
                setActiveTab('my');
                fetchAppointments();
            }, 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setBooking(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            await appointmentsAPI.cancel(id);
            toast.success('Appointment cancelled');
            fetchAppointments();
        } catch {
            toast.error('Failed to cancel appointment');
        }
    };

    const getStatusBadge = (status) => {
        const map = { confirmed: 'badge-success', pending: 'badge-warning', completed: 'badge-primary', cancelled: 'badge-error', rescheduled: 'badge-warning' };
        return map[status] || 'badge-gray';
    };

    return (
        <DashboardLayout title="Appointments">
            <div className="appointment-page">
                {/* Tabs */}
                <div className="appt-tabs">
                    <button className={`appt-tab ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
                        <Plus size={16} /> Book Appointment
                    </button>
                    <button className={`appt-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => { setActiveTab('my'); fetchAppointments(); }}>
                        <Calendar size={16} /> My Appointments
                    </button>
                </div>

                {activeTab === 'book' && (
                    <div className="book-flow">
                        {/* Steps */}
                        <div className="book-steps">
                            {['Choose Doctor', 'Select Date & Time', 'Confirm'].map((s, i) => (
                                <div key={i} className={`book-step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                                    <div className="book-step-num">
                                        {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                                    </div>
                                    <span>{s}</span>
                                    {i < 2 && <div className="book-step-line" />}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Choose Doctor */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                {loadingDoctors ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                        Loading doctors...
                                    </div>
                                ) : (
                                    <>
                                        <div className="spec-filter">
                                            {specialties.map(s => (
                                                <button key={s} className={`spec-btn ${filterSpec === s ? 'active' : ''}`} onClick={() => setFilterSpec(s)}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="doctors-select-grid">
                                            {filteredDoctors.length === 0 ? (
                                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
                                                    <Stethoscope size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                                    <h3 style={{ color: '#475569', marginBottom: 8 }}>No Doctors Available</h3>
                                                    <p>There are currently no doctors registered in the system.</p>
                                                </div>
                                            ) : (
                                                filteredDoctors.map(doc => (
                                                    <div
                                                        key={doc.id}
                                                        className={`doctor-select-card ${selectedDoctor?.id === doc.id ? 'selected' : ''} ${!doc.available ? 'unavailable' : ''}`}
                                                        onClick={() => doc.available && setSelectedDoctor(doc)}
                                                        style={selectedDoctor?.id === doc.id ? { borderColor: doc.color, background: `${doc.color}08` } : {}}
                                                    >
                                                        <div className="dsc-avatar" style={{ background: `linear-gradient(135deg, ${doc.color}, ${doc.color}88)` }}>
                                                            {(doc.name || doc.lastName || 'D')[0]}
                                                        </div>
                                                        <div className="dsc-info">
                                                            <div className="dsc-name">{doc.name}</div>
                                                            <div className="dsc-spec">{doc.specialty}</div>
                                                            <div className="dsc-meta">
                                                                <span>⭐ {doc.rating}</span>
                                                                <span><MapPin size={10} /> {doc.hospital}</span>
                                                            </div>
                                                        </div>
                                                        {!doc.available && <span className="badge badge-error" style={{ position: 'absolute', top: 12, right: 12 }}>Unavailable</span>}
                                                        {selectedDoctor?.id === doc.id && <CheckCircle size={18} color={doc.color} style={{ position: 'absolute', top: 12, right: 12 }} />}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                    <button className="btn btn-primary" disabled={!selectedDoctor} onClick={() => setStep(2)}>
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div className="step2-grid animate-fade-in">
                                <div>
                                    <h4 className="step-subtitle">Select Date</h4>
                                    <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
                                </div>
                                <div>
                                    <h4 className="step-subtitle">
                                        {selectedDate ? `Available Slots — ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}` : 'Select a date first'}
                                    </h4>
                                    {selectedDate && (
                                        <div className="time-slots-grid">
                                            {TIME_SLOTS.map(slot => {
                                                const isBooked = BOOKED_SLOTS.includes(slot);
                                                return (
                                                    <button
                                                        key={slot}
                                                        className={`time-slot ${isBooked ? 'booked' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                                                        disabled={isBooked}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        <Clock size={12} />
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                    <button className="btn btn-ghost" onClick={() => setStep(1)}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <button className="btn btn-primary" disabled={!selectedDate || !selectedSlot} onClick={() => setStep(3)}>
                                        Continue <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 3 && !showSuccess && (
                            <div className="confirm-card animate-fade-in">
                                <h4 className="step-subtitle">Confirm Your Appointment</h4>
                                <div className="confirm-details">
                                    <div className="confirm-row">
                                        <Stethoscope size={16} color="#64748b" />
                                        <div>
                                            <div className="confirm-label">Doctor</div>
                                            <div className="confirm-value">{selectedDoctor?.name} • {selectedDoctor?.specialty}</div>
                                        </div>
                                    </div>
                                    <div className="confirm-row">
                                        <Calendar size={16} color="#64748b" />
                                        <div>
                                            <div className="confirm-label">Date & Time</div>
                                            <div className="confirm-value">
                                                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedSlot}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="confirm-row">
                                        <MapPin size={16} color="#64748b" />
                                        <div>
                                            <div className="confirm-label">Hospital</div>
                                            <div className="confirm-value">{selectedDoctor?.hospital}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginTop: 16 }}>
                                    <label className="input-label">Reason for Visit (optional)</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        placeholder="Describe your symptoms or reason for the appointment..."
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                                    <button className="btn btn-ghost" onClick={() => setStep(2)}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <button className="btn btn-primary" onClick={handleBook} disabled={booking}>
                                        {booking ? <><div className="spinner" /> Booking...</> : <><CheckCircle size={16} /> Confirm Booking</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="success-card animate-scale-in">
                                <div className="success-icon">
                                    <CheckCircle size={40} color="white" />
                                </div>
                                <h3>Appointment Booked!</h3>
                                <p>Your appointment with {selectedDoctor?.name} has been confirmed.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* My Appointments Tab */}
                {activeTab === 'my' && (
                    <div className="my-appointments animate-fade-in">
                        {loadingAppointments ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                Loading appointments...
                            </div>
                        ) : myAppointments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                <h3 style={{ color: '#475569', marginBottom: 8 }}>No Appointments Yet</h3>
                                <p>Book your first appointment to get started</p>
                                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('book')}>
                                    <Plus size={16} /> Book Appointment
                                </button>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Doctor</th>
                                            <th>Specialty</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myAppointments.map(appt => (
                                            <tr key={appt.id || appt._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3b82f620', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                            {(appt.doctorName || 'D')[0]}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{appt.doctorName || 'Doctor'}</span>
                                                    </div>
                                                </td>
                                                <td>{appt.specialty || '—'}</td>
                                                <td>{appt.date ? new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                                <td>{appt.time || '—'}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(appt.status)}`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {(appt.status === 'pending' || appt.status === 'confirmed') ? (
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(appt.id || appt._id)}>
                                                            <X size={12} /> Cancel
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
