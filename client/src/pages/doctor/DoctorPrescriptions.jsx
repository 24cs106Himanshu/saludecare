import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Pill, Plus, Search, Download, Eye, X, CheckCircle, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { prescriptionsAPI, patientsAPI } from '../../services/api';

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0d9488'];
const MEDICINE_DB = ['Atorvastatin', 'Aspirin', 'Metformin', 'Lisinopril', 'Amlodipine', 'Warfarin', 'Furosemide', 'Carvedilol', 'Digoxin', 'Amiodarone', 'Apixaban', 'Glipizide', 'Ibuprofen', 'Paracetamol', 'Omeprazole', 'Pantoprazole'];

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
const EMPTY_FORM = { patientId: '', patientName: '', medicines: [{ ...EMPTY_MED }], notes: '', status: 'active' };

export default function DoctorPrescriptions() {
    const location = useLocation();
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = new, id = editing
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [viewRx, setViewRx] = useState(null); // for detail view modal

    const fetchPrescriptions = () => {
        setLoading(true);
        prescriptionsAPI.getAll()
            .then(res => {
                const normalized = res.data.map((p, i) => ({
                    ...p,
                    id: p.id || p._id,
                    patient: p.patientName || p.patient || `Patient #${i + 1}`,
                    date: p.prescribedDate
                        ? new Date(p.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    medicines: p.medicines || [],
                    status: (p.status || 'active').toLowerCase(),
                    avatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
                }));
                setPrescriptions(normalized);
            })
            .catch(() => toast.error('Failed to load prescriptions'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPrescriptions();
        patientsAPI.getAll()
            .then(res => setPatients(res.data.map(p => ({
                id: p.id || p._id,
                name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
            }))))
            .catch(() => { });

        // Auto-open form if navigated here from patient page
        if (location.state?.patient) {
            const { id, name } = location.state.patient;
            setForm(f => ({ ...f, patientId: id || '', patientName: name || '' }));
            setEditingId(null);
            setShowForm(true);
        }
    }, []);

    const filtered = prescriptions.filter(p =>
        p.patient.toLowerCase().includes(search.toLowerCase()) ||
        (p.medicines || []).some(m => (m.name || '').toLowerCase().includes(search.toLowerCase()))
    );

    const addMedicine = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...EMPTY_MED }] }));
    const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
    const updateMed = (i, field, val) => setForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));

    const openNew = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, medicines: [{ ...EMPTY_MED }] });
        setShowForm(true);
    };

    const openEdit = (rx) => {
        setEditingId(rx.id);
        setForm({
            patientId: rx.patientId || rx.id || '',
            patientName: rx.patient,
            medicines: rx.medicines.length > 0 ? rx.medicines.map(m => ({ ...EMPTY_MED, ...m })) : [{ ...EMPTY_MED }],
            notes: rx.notes || '',
            status: rx.status || 'active',
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...EMPTY_FORM, medicines: [{ ...EMPTY_MED }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.patientName) { toast.error('Please select a patient'); return; }
        if (!form.medicines[0].name) { toast.error('Add at least one medicine'); return; }
        setSubmitting(true);
        try {
            if (editingId) {
                // UPDATE
                await prescriptionsAPI.update(editingId, {
                    patientName: form.patientName,
                    medicines: form.medicines,
                    notes: form.notes,
                    status: form.status,
                });
                toast.success(`Prescription updated for ${form.patientName}!`);
            } else {
                // CREATE
                await prescriptionsAPI.create({
                    patientId: form.patientId,
                    patientName: form.patientName,
                    medicines: form.medicines,
                    notes: form.notes,
                    prescribedDate: new Date().toISOString(),
                    status: 'active',
                });
                toast.success(`Prescription written for ${form.patientName}!`);
            }
            closeForm();
            fetchPrescriptions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save prescription');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkCompleted = async (rx) => {
        try {
            await prescriptionsAPI.update(rx.id, { status: 'completed' });
            toast.success('Prescription marked as completed');
            fetchPrescriptions();
        } catch {
            toast.error('Failed to update status');
        }
    };

    return (
        <DashboardLayout title="Prescriptions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div className="input-with-icon" style={{ flex: 1, maxWidth: 360 }}>
                        <Search size={16} className="input-icon" />
                        <input type="text" className="input-field" placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchPrescriptions} title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                    <button className="btn btn-primary" onClick={openNew}>
                        <Plus size={16} /> Write Prescription
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                        Loading prescriptions...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <Pill size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                            {prescriptions.length === 0 ? 'No prescriptions yet' : 'No results found'}
                        </p>
                        {prescriptions.length === 0 && (
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
                                Write your first prescription to get started
                            </p>
                        )}
                        {prescriptions.length === 0 && (
                            <button className="btn btn-primary btn-sm" onClick={openNew}>
                                <Plus size={14} /> Write Prescription
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Medicines</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(rx => (
                                    <tr key={rx.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: rx.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.8rem', flexShrink: 0 }}>
                                                    {(rx.patient || 'P')[0]}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{rx.patient}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{rx.date}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {(rx.medicines || []).slice(0, 2).map((m, i) => (
                                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#eff6ff', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, color: '#2563eb' }}>
                                                        <Pill size={10} /> {m.name} {m.dosage}
                                                    </span>
                                                ))}
                                                {rx.medicines.length > 2 && (
                                                    <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: 99, fontSize: '0.72rem', color: '#64748b' }}>
                                                        +{rx.medicines.length - 2} more
                                                    </span>
                                                )}
                                                {(!rx.medicines || rx.medicines.length === 0) && (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${rx.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{rx.status}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="View Details"
                                                    onClick={() => setViewRx(rx)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="Edit Prescription"
                                                    style={{ color: '#3b82f6' }}
                                                    onClick={() => openEdit(rx)}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {rx.status === 'active' && (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        title="Mark as Completed"
                                                        style={{ color: '#10b981' }}
                                                        onClick={() => handleMarkCompleted(rx)}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="Download"
                                                    onClick={() => toast.success('Download coming soon!')}
                                                >
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── View Detail Modal ── */}
                {viewRx && (
                    <div className="modal-overlay" onClick={() => setViewRx(null)}>
                        <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Prescription Detail</h3>
                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                        {viewRx.patient} • {viewRx.date}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => { setViewRx(null); openEdit(viewRx); }}>
                                        <Edit2 size={13} /> Edit
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setViewRx(null)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: 24 }}>
                                {/* Letterhead */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', borderRadius: 12, border: '1px solid #bfdbfe', marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#2563eb,#0d9488)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>℞</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Prescription</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Medicare Health System</div>
                                        </div>
                                    </div>
                                    <span className={`badge ${viewRx.status === 'active' ? 'badge-success' : 'badge-gray'}`}>{viewRx.status}</span>
                                </div>

                                {/* Medicines */}
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Medicines</div>
                                    {(viewRx.medicines || []).length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>No medicines listed.</p>
                                    ) : (viewRx.medicines || []).map((med, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 8 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: 6 }}>
                                                    {med.name} <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 500 }}>{med.dosage}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                                                    {[['Frequency', med.frequency], ['Duration', med.duration], ['Instructions', med.instructions]].map(([label, val]) => (
                                                        <div key={label}>
                                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                                                            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{val || '—'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {viewRx.notes && (
                                    <div style={{ padding: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, marginBottom: 16 }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Doctor's Notes</div>
                                        <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.6 }}>{viewRx.notes}</p>
                                    </div>
                                )}
                                <p style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    ⚠️ This prescription is for informational purposes only. Always follow the prescribing doctor's advice.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Write / Edit Prescription Modal ── */}
                {showForm && (
                    <div className="modal-overlay" onClick={closeForm}>
                        <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                                        {editingId ? '✏️ Edit Prescription' : '📋 Write Prescription'}
                                    </h3>
                                    {editingId && (
                                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                            Editing prescription for <strong>{form.patientName}</strong>
                                        </p>
                                    )}
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={closeForm}><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '75vh', overflowY: 'auto' }}>

                                {/* Patient */}
                                <div className="input-group">
                                    <label className="input-label">Patient</label>
                                    {editingId ? (
                                        // Editing: show patient name as read-only
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={form.patientName}
                                            readOnly
                                            style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                                        />
                                    ) : (
                                        <select
                                            className="input-field"
                                            value={form.patientId}
                                            onChange={e => {
                                                const p = patients.find(pt => pt.id === e.target.value);
                                                setForm(f => ({ ...f, patientId: e.target.value, patientName: p?.name || e.target.value }));
                                            }}
                                        >
                                            <option value="">Select patient...</option>
                                            {patients.length > 0
                                                ? patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                                : <option value="manual">Enter name manually below</option>
                                            }
                                        </select>
                                    )}
                                </div>
                                {!editingId && patients.length === 0 && (
                                    <div className="input-group">
                                        <label className="input-label">Patient Name</label>
                                        <input type="text" className="input-field" placeholder="Enter patient name" value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} />
                                    </div>
                                )}

                                {/* Status (only when editing) */}
                                {editingId && (
                                    <div className="input-group">
                                        <label className="input-label">Status</label>
                                        <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                )}

                                {/* Medicines */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <label className="input-label">Medicines</label>
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={addMedicine}><Plus size={12} /> Add Medicine</button>
                                    </div>
                                    {form.medicines.map((med, i) => (
                                        <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #e2e8f0', position: 'relative' }}>
                                            {form.medicines.length > 1 && (
                                                <button type="button" style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => removeMedicine(i)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>MEDICINE {i + 1}</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                <div className="input-group">
                                                    <label className="input-label">Medicine Name</label>
                                                    <input type="text" className="input-field" placeholder="e.g. Atorvastatin" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} list={`med-list-${i}`} />
                                                    <datalist id={`med-list-${i}`}>{MEDICINE_DB.map(m => <option key={m} value={m} />)}</datalist>
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Dosage</label>
                                                    <input type="text" className="input-field" placeholder="e.g. 20mg" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Frequency</label>
                                                    <select className="input-field" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)}>
                                                        <option value="">Select...</option>
                                                        <option>Once daily</option>
                                                        <option>Twice daily</option>
                                                        <option>Three times daily</option>
                                                        <option>As needed</option>
                                                        <option>Every 4 hours</option>
                                                        <option>Every 6 hours</option>
                                                        <option>Weekly</option>
                                                    </select>
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Duration</label>
                                                    <input type="text" className="input-field" placeholder="e.g. 30 days" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="input-group" style={{ marginTop: 10 }}>
                                                <label className="input-label">Instructions</label>
                                                <input type="text" className="input-field" placeholder="e.g. Take after meals" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notes */}
                                <div className="input-group">
                                    <label className="input-label">Doctor's Notes (optional)</label>
                                    <textarea className="input-field" rows={3} placeholder="Additional instructions..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                                </div>

                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                                    <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting
                                            ? <><div className="spinner" /> Saving...</>
                                            : editingId
                                                ? <><CheckCircle size={16} /> Update Prescription</>
                                                : <><CheckCircle size={16} /> Issue Prescription</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
