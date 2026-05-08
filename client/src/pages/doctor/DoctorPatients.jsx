import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Search, Eye, Calendar, Activity, FileText, Phone, Mail, X, RefreshCw } from 'lucide-react';
import { patientsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0d9488'];

export default function DoctorPatients() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = () => {
        setLoading(true);
        patientsAPI.getAll()
            .then(res => {
                const normalized = res.data.map((p, i) => ({
                    ...p,
                    id: p.id || p._id,
                    name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || `Patient #${i + 1}`,
                    age: p.age || p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : '—',
                    gender: p.gender || '—',
                    blood: p.bloodGroup || p.blood || '—',
                    phone: p.phone || p.phoneNumber || '—',
                    email: p.email || '—',
                    condition: p.condition || p.primaryCondition || 'General',
                    lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
                    visits: p.visits || p.totalVisits || 0,
                    avatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    status: p.status || 'active',
                }));
                setPatients(normalized);
            })
            .catch(() => {
                setPatients([]);
                toast.error('Failed to load patients');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPatients(); }, []);

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.condition || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="My Patients">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stats */}
                <div className="pd-stats-grid">
                    {[
                        { label: 'Total Patients', value: patients.length, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Active', value: patients.filter(p => p.status === 'active').length, color: '#10b981', bg: '#f0fdf4' },
                        { label: 'Critical', value: patients.filter(p => p.status === 'critical').length, color: '#ef4444', bg: '#fef2f2' },
                        { label: 'Avg. Visits', value: patients.length > 0 ? Math.round(patients.reduce((a, p) => a + (Number(p.visits) || 0), 0) / patients.length) : 0, color: '#8b5cf6', bg: '#f5f3ff' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
                                <Activity size={20} />
                            </div>
                            <div className="stat-card-info">
                                <div className="stat-card-value">{loading ? '—' : s.value}</div>
                                <div className="stat-card-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
                    {/* Patient List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div className="input-with-icon" style={{ flex: 1, maxWidth: 360 }}>
                                <Search size={16} className="input-icon" />
                                <input type="text" className="input-field" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={fetchPatients} title="Refresh">
                                <RefreshCw size={14} />
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                Loading patients...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                <Activity size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                <p>{patients.length === 0 ? 'No patients yet' : 'No results found'}</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Age / Gender</th>
                                            <th>Condition</th>
                                            <th>Last Visit</th>
                                            <th>Visits</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(p => (
                                            <tr key={p.id} style={{ cursor: 'pointer', background: selected?.id === p.id ? '#eff6ff' : '' }} onClick={() => setSelected(p)}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: p.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem', flexShrink: 0 }}>
                                                            {(p.name || 'P')[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{p.name}</div>
                                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.blood} • {p.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{p.age} / {p.gender}</td>
                                                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.condition}</td>
                                                <td>{p.lastVisit}</td>
                                                <td><span className="badge badge-primary">{p.visits}</span></td>
                                                <td>
                                                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelected(p); }}>
                                                        <Eye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Patient Detail Panel */}
                    {selected && (
                        <div className="card animate-fade-in-right" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 80 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Patient Profile</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={14} /></button>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <div style={{ width: 72, height: 72, borderRadius: 20, background: selected.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '0 auto 12px' }}>
                                    {(selected.name || 'P')[0]}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{selected.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>{selected.condition}</div>
                                <span className={`badge ${selected.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ marginTop: 8 }}>
                                    {selected.status}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                {[
                                    { label: 'Age', value: selected.age },
                                    { label: 'Gender', value: selected.gender },
                                    { label: 'Blood Group', value: selected.blood },
                                    { label: 'Total Visits', value: selected.visits },
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#475569' }}>
                                    <Phone size={14} color="#94a3b8" /> {selected.phone}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#475569' }}>
                                    <Mail size={14} color="#94a3b8" /> {selected.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#475569' }}>
                                    <Calendar size={14} color="#94a3b8" /> Last visit: {selected.lastVisit}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button
                                    className="btn btn-primary btn-full btn-sm"
                                    onClick={() => navigate('/doctor/prescriptions', { state: { patient: { id: selected.id, name: selected.name } } })}
                                >
                                    <FileText size={14} /> Write Prescription
                                </button>
                                <button
                                    className="btn btn-secondary btn-full btn-sm"
                                    onClick={() => navigate('/doctor/appointments')}
                                >
                                    <Calendar size={14} /> View Appointments
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
