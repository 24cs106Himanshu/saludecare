import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Activity, Eye, EyeOff, CheckCircle, Heart, Stethoscope, UserPlus
} from 'lucide-react';
import './AuthPages.css';

const ROLES = [
    { id: 'patient', label: 'Patient', icon: Heart, color: '#38bdf8' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#10b981' }
];

export default function RegisterPage() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'patient',
        dob: '', gender: '', specialization: '', licenseNumber: '', experience: '', consultationFee: ''
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
        if (!form.email) errs.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.password) errs.password = 'Required';
        else if (form.password.length < 6) errs.password = 'Min 6 chars';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

        if (form.role === 'patient') {
            if (!form.dob) errs.dob = 'Required';
            if (!form.gender) errs.gender = 'Required';
        } else if (form.role === 'doctor') {
            if (!form.specialization) errs.specialization = 'Required';
            if (!form.licenseNumber) errs.licenseNumber = 'Required';
            if (!form.experience) errs.experience = 'Required';
            if (!form.consultationFee) errs.consultationFee = 'Required';
        }

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        const result = await register({
            firstName: form.firstName,
            lastName: form.lastName,
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: form.role,
            ...(form.role === 'patient' && {
                dob: form.dob,
                gender: form.gender
            }),
            ...(form.role === 'doctor' && {
                specialization: form.specialization,
                licenseNumber: form.licenseNumber,
                experience: form.experience,
                consultationFee: form.consultationFee
            })
        });

        if (result.success) {
            toast.success('Account created successfully! Welcome to Medicare 🎉');
            navigate(`/${result.user?.role || form.role}`);
        } else {
            toast.error(result.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg">
                    <div className="auth-orb auth-orb-1" />
                    <div className="auth-orb auth-orb-2" />
                    <div className="auth-grid" />
                </div>

                <div className="auth-left-content">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-icon">
                            <Activity size={20} color="white" />
                        </div>
                        <span>Medicare</span>
                    </Link>

                    <div className="auth-left-hero">
                        <h2 className="auth-left-title">
                            Join thousands of<br />
                            <span className="gradient-text-hero">healthier lives.</span>
                        </h2>
                        <p className="auth-left-subtitle">
                            Create your free Medicare account and get access to world-class healthcare management tools.
                        </p>
                    </div>

                    <div className="auth-features">
                        {[
                            'Free account, no credit card needed',
                            'Connect with 200+ specialists',
                            'Secure & HIPAA compliant',
                            'AI health assistant included',
                        ].map((f, i) => (
                            <div key={i} className="auth-feature-item">
                                <CheckCircle size={16} color="#2dd4bf" />
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>

                    <div className="auth-left-stats">
                        <div className="auth-stat">
                            <div className="auth-stat-value">Free</div>
                            <div className="auth-stat-label">To Start</div>
                        </div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat">
                            <div className="auth-stat-value">2 min</div>
                            <div className="auth-stat-label">Setup</div>
                        </div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat">
                            <div className="auth-stat-value">100%</div>
                            <div className="auth-stat-label">Secure</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Create account</h1>
                        <p className="auth-form-subtitle">Start your healthcare journey today</p>
                    </div>

                    <div className="auth-role-selector" style={{ marginBottom: '24px', gap: '16px' }}>
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            const isActive = form.role === r.id;
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    className={`auth-role-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => update('role', r.id)}
                                    style={{
                                        borderColor: isActive ? r.color : '#e2e8f0',
                                        background: isActive ? 'transparent' : 'white',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        padding: '16px'
                                    }}
                                >
                                    <Icon size={24} color={isActive ? r.color : '#94a3b8'} />
                                    <span style={{ color: isActive ? r.color : '#64748b', fontWeight: isActive ? 600 : 500 }}>
                                        {r.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="auth-name-row">
                            <div className="input-group">
                                <label className="input-label" style={{ fontSize: '0.85rem' }}>First Name</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.firstName ? 'error' : ''}`}
                                    placeholder="First name"
                                    value={form.firstName}
                                    onChange={e => update('firstName', e.target.value)}
                                    style={{ paddingLeft: '14px' }}
                                />
                                {errors.firstName && <span className="input-error">{errors.firstName}</span>}
                            </div>
                            <div className="input-group">
                                <label className="input-label" style={{ fontSize: '0.85rem' }}>Last Name</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.lastName ? 'error' : ''}`}
                                    placeholder="Last name"
                                    value={form.lastName}
                                    onChange={e => update('lastName', e.target.value)}
                                    style={{ paddingLeft: '14px' }}
                                />
                                {errors.lastName && <span className="input-error">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.85rem' }}>Email Address</label>
                            <input
                                type="email"
                                className={`input-field ${errors.email ? 'error' : ''}`}
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={e => update('email', e.target.value)}
                                style={{ paddingLeft: '14px' }}
                            />
                            {errors.email && <span className="input-error">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.85rem' }}>Phone Number</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="Enter your phone number"
                                value={form.phone}
                                onChange={e => update('phone', e.target.value)}
                                style={{ paddingLeft: '14px' }}
                            />
                        </div>

                        {form.role === 'patient' && (
                            <div style={{ border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', marginTop: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <Heart size={16} /> Patient Information
                                </div>
                                <div className="auth-name-row">
                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.85rem' }}>Date of Birth</label>
                                        <input
                                            type="date"
                                            className={`input-field ${errors.dob ? 'error' : ''}`}
                                            value={form.dob}
                                            onChange={e => update('dob', e.target.value)}
                                            style={{ colorScheme: 'dark', paddingLeft: '14px' }}
                                        />
                                        {errors.dob && <span className="input-error">{errors.dob}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.85rem' }}>Gender</label>
                                        <select
                                            className={`input-field ${errors.gender ? 'error' : ''}`}
                                            value={form.gender}
                                            onChange={e => update('gender', e.target.value)}
                                            style={{ paddingLeft: '14px' }}
                                        >
                                            <option value="" disabled hidden>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && <span className="input-error">{errors.gender}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {form.role === 'doctor' && (
                            <div style={{ border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', marginTop: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <Stethoscope size={16} /> Professional Information
                                </div>
                                <div className="input-group" style={{ marginBottom: '16px' }}>
                                    <label className="input-label" style={{ fontSize: '0.85rem' }}>Specialization</label>
                                    <input
                                        type="text"
                                        className={`input-field ${errors.specialization ? 'error' : ''}`}
                                        placeholder="e.g., Cardiology, Dermatology"
                                        value={form.specialization}
                                        onChange={e => update('specialization', e.target.value)}
                                        style={{ paddingLeft: '14px' }}
                                    />
                                    {errors.specialization && <span className="input-error">{errors.specialization}</span>}
                                </div>
                                <div className="input-group" style={{ marginBottom: '16px' }}>
                                    <label className="input-label" style={{ fontSize: '0.85rem' }}>License Number</label>
                                    <input
                                        type="text"
                                        className={`input-field ${errors.licenseNumber ? 'error' : ''}`}
                                        placeholder="Medical license number"
                                        value={form.licenseNumber}
                                        onChange={e => update('licenseNumber', e.target.value)}
                                        style={{ paddingLeft: '14px' }}
                                    />
                                    {errors.licenseNumber && <span className="input-error">{errors.licenseNumber}</span>}
                                </div>
                                <div className="auth-name-row">
                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.85rem' }}>Experience (years)</label>
                                        <input
                                            type="number"
                                            className={`input-field ${errors.experience ? 'error' : ''}`}
                                            placeholder="Years"
                                            value={form.experience}
                                            onChange={e => update('experience', e.target.value)}
                                            style={{ paddingLeft: '14px' }}
                                        />
                                        {errors.experience && <span className="input-error">{errors.experience}</span>}
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label" style={{ fontSize: '0.85rem' }}>Consultation Fee ($)</label>
                                        <input
                                            type="number"
                                            className={`input-field ${errors.consultationFee ? 'error' : ''}`}
                                            placeholder="Fee"
                                            value={form.consultationFee}
                                            onChange={e => update('consultationFee', e.target.value)}
                                            style={{ paddingLeft: '14px' }}
                                        />
                                        {errors.consultationFee && <span className="input-error">{errors.consultationFee}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.85rem' }}>Password</label>
                            <div className="input-with-icon" style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className={`input-field ${errors.password ? 'error' : ''}`}
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={e => update('password', e.target.value)}
                                    style={{ paddingLeft: '14px', paddingRight: '44px', width: '100%' }}
                                />
                                <button type="button" className="input-toggle-pass" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <span className="input-error">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.85rem' }}>Confirm Password</label>
                            <div className="input-with-icon" style={{ position: 'relative' }}>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={e => update('confirmPassword', e.target.value)}
                                    style={{ paddingLeft: '14px', paddingRight: '44px', width: '100%' }}
                                />
                                <button type="button" className="input-toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                            style={{
                                background: '#0284c7',
                                borderColor: '#0284c7',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '12px',
                                borderRadius: '8px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create Medicare Account
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
