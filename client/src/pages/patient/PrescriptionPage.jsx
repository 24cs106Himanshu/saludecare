import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Pill, Download, Eye, Search, Calendar, User, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { prescriptionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './PrescriptionPage.css';

// Fallback sample data shown when no prescriptions exist yet
const SAMPLE_PRESCRIPTIONS = [
    {
        id: 'sample-1', date: 'Sample', doctor: 'Dr. Sarah Mitchell', specialty: 'Cardiologist',
        status: 'Active', color: '#3b82f6',
        medicines: [
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (night)', duration: '3 months', instructions: 'Take after dinner' },
        ],
        notes: 'This is sample data. Add a real prescription via the doctor\'s panel.',
        isSample: true,
    },
];

export default function PrescriptionPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPrescriptions = () => {
        setLoading(true);
        prescriptionsAPI.getAll()
            .then(res => {
                const data = res.data;
                if (data.length === 0) {
                    // Show sample data so the UI doesn't look empty
                    setPrescriptions(SAMPLE_PRESCRIPTIONS);
                } else {
                    // Normalize backend data to match UI expectations
                    const normalized = data.map(p => ({
                        ...p,
                        id: p.id || p._id,
                        date: p.prescribedDate
                            ? new Date(p.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        doctor: p.doctorName || p.doctor || 'Doctor',
                        specialty: p.specialty || 'General',
                        status: (p.status || 'Active').toLowerCase(),
                        color: '#3b82f6',
                        medicines: p.medicines || p.medications || [],
                        notes: p.notes || p.instructions || '',
                    }));
                    setPrescriptions(normalized);
                }
            })
            .catch(() => {
                setPrescriptions(SAMPLE_PRESCRIPTIONS);
                toast.error('Could not load prescriptions from server. Showing sample data.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPrescriptions(); }, []);

    const filtered = prescriptions.filter(p => {
        const matchSearch = (p.doctor || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.medicines || []).some(m => (m.name || '').toLowerCase().includes(search.toLowerCase()));
        const matchFilter = filter === 'all' || (p.status || '').toLowerCase() === filter;
        return matchSearch && matchFilter;
    });

    return (
        <DashboardLayout title="Prescriptions">
            <div className="prescription-page">
                {/* Header Controls */}
                <div className="rx-controls">
                    <div className="input-with-icon" style={{ flex: 1, maxWidth: 360 }}>
                        <Search size={16} className="input-icon" />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search prescriptions or medicines..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="rx-filter-btns">
                        {['all', 'active', 'completed'].map(f => (
                            <button key={f} className={`spec-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchPrescriptions} title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                        Loading prescriptions...
                    </div>
                ) : (
                    <div className="rx-layout">
                        {/* List */}
                        <div className="rx-list">
                            {filtered.length === 0 && (
                                <div className="rx-empty">
                                    <Pill size={40} color="#cbd5e1" />
                                    <p>No prescriptions found</p>
                                </div>
                            )}
                            {filtered.map(rx => (
                                <div
                                    key={rx.id}
                                    className={`rx-card ${selected?.id === rx.id ? 'selected' : ''}`}
                                    onClick={() => setSelected(rx)}
                                    style={selected?.id === rx.id ? { borderColor: rx.color, background: `${rx.color}06` } : {}}
                                >
                                    <div className="rx-card-header">
                                        <div className="rx-doc-avatar" style={{ background: `${rx.color}20`, color: rx.color }}>
                                            {(rx.doctor || 'D').split(' ').slice(-1)[0][0]}
                                        </div>
                                        <div className="rx-card-info">
                                            <div className="rx-doctor">{rx.doctor}</div>
                                            <div className="rx-spec">{rx.specialty}</div>
                                            <div className="rx-date">
                                                <Calendar size={11} /> {rx.date}
                                            </div>
                                        </div>
                                        <span className={`badge ${rx.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                                            {rx.status === 'active' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {rx.status}
                                        </span>
                                    </div>
                                    {rx.isSample && (
                                        <div style={{ fontSize: '0.7rem', color: '#f59e0b', padding: '4px 0', fontStyle: 'italic' }}>
                                            📋 Sample data
                                        </div>
                                    )}
                                    <div className="rx-medicines-preview">
                                        {(rx.medicines || []).map((m, i) => (
                                            <span key={i} className="rx-med-tag">
                                                <Pill size={10} /> {m.name} {m.dosage}
                                            </span>
                                        ))}
                                        {(!rx.medicines || rx.medicines.length === 0) && (
                                            <span className="rx-med-tag" style={{ color: '#94a3b8' }}>No medicines listed</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detail View */}
                        <div className="rx-detail">
                            {!selected ? (
                                <div className="rx-detail-empty">
                                    <Pill size={48} color="#cbd5e1" />
                                    <h3>Select a Prescription</h3>
                                    <p>Click on a prescription to view details</p>
                                </div>
                            ) : (
                                <div className="rx-detail-content animate-fade-in">
                                    <div className="rx-detail-header">
                                        <div>
                                            <h3 className="rx-detail-title">Prescription Details</h3>
                                            <p className="rx-detail-meta">
                                                <User size={13} /> {selected.doctor} • <Calendar size={13} /> {selected.date}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-ghost btn-sm">
                                                <Eye size={14} /> View
                                            </button>
                                            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Download feature coming soon!')}>
                                                <Download size={14} /> Download
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rx Header */}
                                    <div className="rx-letterhead">
                                        <div className="rx-lh-left">
                                            <div className="rx-lh-logo">℞</div>
                                            <div>
                                                <div className="rx-lh-doctor">{selected.doctor}</div>
                                                <div className="rx-lh-spec">{selected.specialty}</div>
                                            </div>
                                        </div>
                                        <div className="rx-lh-date">Date: {selected.date}</div>
                                    </div>

                                    {/* Medicines */}
                                    <div className="rx-medicines-list">
                                        <h4 className="rx-section-title">Prescribed Medicines</h4>
                                        {(selected.medicines || []).length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No medicines listed for this prescription.</p>
                                        ) : (selected.medicines || []).map((med, i) => (
                                            <div key={i} className="rx-medicine-item">
                                                <div className="rx-med-num">{i + 1}</div>
                                                <div className="rx-med-details">
                                                    <div className="rx-med-name">{med.name} <span className="rx-med-dose">{med.dosage}</span></div>
                                                    <div className="rx-med-info-grid">
                                                        <div className="rx-med-info-item">
                                                            <span className="rx-info-label">Frequency</span>
                                                            <span className="rx-info-value">{med.frequency || '—'}</span>
                                                        </div>
                                                        <div className="rx-med-info-item">
                                                            <span className="rx-info-label">Duration</span>
                                                            <span className="rx-info-value">{med.duration || '—'}</span>
                                                        </div>
                                                        <div className="rx-med-info-item">
                                                            <span className="rx-info-label">Instructions</span>
                                                            <span className="rx-info-value">{med.instructions || '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Notes */}
                                    {selected.notes && (
                                        <div className="rx-notes">
                                            <h4 className="rx-section-title">Doctor's Notes</h4>
                                            <p>{selected.notes}</p>
                                        </div>
                                    )}

                                    <div className="rx-disclaimer">
                                        ⚠️ This prescription is for informational purposes. Always follow your doctor's advice.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
