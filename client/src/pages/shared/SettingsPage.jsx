import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { User, Settings as SettingsIcon, Save, HeartPulse, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Initialize form with existing user data
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        gender: user?.gender || '',

        // Doctor specific
        specialization: user?.specialization || '',
        licenseNumber: user?.licenseNumber || '',
        experience: user?.experience || '',
        consultationFee: user?.consultationFee || '',
        hospital: user?.hospital || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToUpdate = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                gender: formData.gender,
            };

            // Include doctor specific fields if user is doctor
            if (user?.role === 'doctor') {
                dataToUpdate.specialization = formData.specialization;
                dataToUpdate.licenseNumber = formData.licenseNumber;
                dataToUpdate.experience = formData.experience;
                dataToUpdate.consultationFee = formData.consultationFee;
                dataToUpdate.hospital = formData.hospital;
            }

            const res = await authAPI.updateProfile(dataToUpdate);

            // Update React state + localStorage via AuthContext
            const updatedUser = res.data.user || { ...user, ...dataToUpdate };
            updateUser(updatedUser);

            toast.success(res.data.message || 'Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Settings">
            <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
                    <div style={{ padding: 10, background: '#f0f9ff', color: '#0ea5e9', borderRadius: 10 }}>
                        <User size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Personal Information</h2>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>Update your account details and profile information.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>First Name</label>
                            <input
                                type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Last Name</label>
                            <input
                                type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Email Address</label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleChange} required
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                            <input
                                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                placeholder="e.g. +1 234 567 890"
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Date of Birth</label>
                            <input
                                type="date" name="dob" value={formData.dob} onChange={handleChange}
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Gender</label>
                            <select
                                name="gender" value={formData.gender} onChange={handleChange}
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s', background: 'white' }}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {user?.role === 'doctor' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 10px', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
                                <div style={{ padding: 10, background: '#f5f3ff', color: '#8b5cf6', borderRadius: 10 }}>
                                    <HeartPulse size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Professional Details</h2>
                                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>Update your medical credentials.</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Specialization</label>
                                    <input
                                        type="text" name="specialization" value={formData.specialization} onChange={handleChange} required
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>License Number</label>
                                    <input
                                        type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Experience (e.g. '10 years')</label>
                                    <input
                                        type="text" name="experience" value={formData.experience} onChange={handleChange}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Consultation Fee (in USD)</label>
                                    <input
                                        type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Hospital Affiliation</label>
                                <input
                                    type="text" name="hospital" value={formData.hospital} onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: '0.2s' }}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="submit" disabled={loading} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? <RefreshCw size={18} className="spinner" /> : <Save size={18} />}
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
