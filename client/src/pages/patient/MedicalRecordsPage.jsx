import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { FileText, Upload, Download, Search, Calendar, Activity, AlertCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { recordsAPI } from '../../services/api';
import './MedicalRecordsPage.css';
import '../patient/AppointmentPage.css';

// No fallback sample data

export default function MedicalRecordsPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [expanded, setExpanded] = useState(null);
    const [activeTab, setActiveTab] = useState('records');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = () => {
        setLoading(true);
        recordsAPI.getAll()
            .then(res => {
                const data = res.data;
                if (data.length === 0) {
                    setRecords([]);
                } else {
                    const normalized = data.map(r => ({
                        ...r,
                        id: r.id || r._id,
                        date: r.date
                            ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        type: r.type || r.recordType || 'Lab Report',
                        title: r.title || r.testName || 'Medical Record',
                        doctor: r.doctorName || r.doctor || 'Doctor',
                        status: r.status || 'normal',
                        category: r.category || 'general',
                        results: r.results || [],
                        notes: r.notes || r.description || '',
                    }));
                    setRecords(normalized);
                }
            })
            .catch(() => {
                setRecords([]);
                toast.error('Could not load records.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchRecords(); }, []);

    const filtered = records.filter(r => {
        const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.doctor.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'all' || r.category === category;
        return matchSearch && matchCat;
    });

    return (
        <DashboardLayout title="Medical Records">
            <div className="records-page">
                {/* Tabs */}
                <div className="appt-tabs">
                    <button className={`appt-tab ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
                        <FileText size={16} /> Reports & Records
                    </button>
                    <button className={`appt-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <Activity size={16} /> Diagnosis History
                    </button>
                </div>

                {activeTab === 'records' && (
                    <>
                        <div className="records-controls">
                            <div className="input-with-icon" style={{ flex: 1, maxWidth: 360 }}>
                                <Search size={16} className="input-icon" />
                                <input type="text" className="input-field" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['all', 'blood', 'imaging', 'checkup', 'general'].map(c => (
                                    <button key={c} className={`spec-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-ghost btn-sm" onClick={fetchRecords} title="Refresh">
                                    <RefreshCw size={14} />
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={() => toast.success('Upload feature coming soon!')}>
                                    <Upload size={14} /> Upload Record
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                Loading records...
                            </div>
                        ) : (
                            <div className="records-list">
                                {filtered.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                        <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                        <p>No records found</p>
                                    </div>
                                )}
                                {filtered.map(record => (
                                    <div key={record.id} className="record-card">
                                        <div className="record-header" onClick={() => setExpanded(expanded === record.id ? null : record.id)}>
                                            <div className="record-icon" style={{ background: record.status === 'abnormal' ? '#fee2e2' : '#f0fdf4', color: record.status === 'abnormal' ? '#ef4444' : '#10b981' }}>
                                                <FileText size={18} />
                                            </div>
                                            <div className="record-info">
                                                <div className="record-title">
                                                    {record.title}
                                                    {record.isSample && <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: 8, fontStyle: 'italic' }}>📋 Sample</span>}
                                                </div>
                                                <div className="record-meta">
                                                    <span><Calendar size={11} /> {record.date}</span>
                                                    <span>{record.doctor}</span>
                                                    <span className="badge badge-gray">{record.type}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                                                <span className={`badge ${record.status === 'normal' ? 'badge-success' : 'badge-error'}`}>
                                                    {record.status === 'normal' ? '✓ Normal' : '⚠ Abnormal'}
                                                </span>
                                                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); toast.success('Downloading...'); }}>
                                                    <Download size={14} />
                                                </button>
                                                {expanded === record.id ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                            </div>
                                        </div>

                                        {expanded === record.id && (
                                            <div className="record-expanded animate-fade-in">
                                                {record.results && record.results.length > 0 && (
                                                    <div className="results-table-wrapper">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Test</th>
                                                                    <th>Result</th>
                                                                    <th>Normal Range</th>
                                                                    <th>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {record.results.map((r, i) => (
                                                                    <tr key={i}>
                                                                        <td style={{ fontWeight: 600 }}>{r.test}</td>
                                                                        <td style={{ fontWeight: 700, color: r.status === 'high' ? '#ef4444' : '#1e293b' }}>{r.value}</td>
                                                                        <td style={{ color: '#64748b' }}>{r.range}</td>
                                                                        <td>
                                                                            <span className={`badge ${r.status === 'normal' ? 'badge-success' : 'badge-error'}`}>
                                                                                {r.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                                {record.notes && (
                                                    <div className="record-notes">
                                                        <AlertCircle size={14} color="#3b82f6" />
                                                        <span>{record.notes}</span>
                                                    </div>
                                                )}
                                                {(!record.results || record.results.length === 0) && !record.notes && (
                                                    <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>No detailed results available.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="diagnosis-history animate-fade-in">
                        <div className="timeline">
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                <Activity size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                <h3 style={{ color: '#475569', marginBottom: 8 }}>No Diagnosis History</h3>
                                <p>Your diagnostic timeline will appear here.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
