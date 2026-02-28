import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Activity, Eye, EyeOff, Mail, Lock, User, Stethoscope, Shield,
    ArrowRight, CheckCircle, Phone
} from 'lucide-react';
import './AuthPages.css';

const ROLES = [
    { id: 'patient', label: 'Patient', icon: User, desc: 'Book appointments & manage health', color: '#3b82f6' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients & appointments', color: '#10b981' },
    { id: 'admin', label: 'Admin', icon: Shield, desc: 'System administration', color: '#8b5cf6' },
];

function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

export default function RegisterPage() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'patient' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'First name required';
        if (!form.lastName.trim()) errs.lastName = 'Last name required';
        if (!form.email) errs.email = 'Email required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.password) errs.password = 'Password required';
        else if (form.password.length < 6) errs.password = 'Min 6 characters';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        if (!agreed) errs.terms = 'Please accept terms';
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
            password: form.password,
            role: form.role,
        });

        if (result.success) {
            toast.success('Account created successfully! Welcome to Medicare 🎉');
            navigate(`/${result.user?.role || form.role}`);
        } else {
            toast.error(result.message || 'Registration failed. Please try again.');
        }
    };

    const strength = getPasswordStrength(form.password);
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', 'weak', 'medium', 'medium', 'strong'][strength];

    return (
        <div className="auth-page">
            {/* Left Panel */}
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

            {/* Right Panel */}
            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Create account</h1>
                        <p className="auth-form-subtitle">Start your healthcare journey today</p>
                    </div>

                    {/* Role Selector */}
                    <div className="auth-role-selector">
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            return (
                                <button
                                    key={r.id}
                                    className={`auth-role-btn ${form.role === r.id ? 'active' : ''}`}
                                    onClick={() => update('role', r.id)}
                                    style={form.role === r.id ? { borderColor: r.color, background: `${r.color}10` } : {}}
                                >
                                    <Icon size={16} color={form.role === r.id ? r.color : '#94a3b8'} />
                                    <span style={form.role === r.id ? { color: r.color } : {}}>{r.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        {/* Name Row */}
                        <div className="auth-name-row">
                            <div className="input-group">
                                <label className="input-label">First Name</label>
                                <div className="input-with-icon">
                                    <User size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        className={`input-field ${errors.firstName ? 'error' : ''}`}
                                        placeholder="John"
                                        value={form.firstName}
                                        onChange={e => update('firstName', e.target.value)}
                                    />
                                </div>
                                {errors.firstName && <span className="input-error">{errors.firstName}</span>}
                            </div>
                            <div className="input-group">
                                <label className="input-label">Last Name</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.lastName ? 'error' : ''}`}
                                    placeholder="Doe"
                                    value={form.lastName}
                                    onChange={e => update('lastName', e.target.value)}
                                />
                                {errors.lastName && <span className="input-error">{errors.lastName}</span>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    className={`input-field ${errors.email ? 'error' : ''}`}
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => update('email', e.target.value)}
                                />
                            </div>
                            {errors.email && <span className="input-error">{errors.email}</span>}
                        </div>

                        {/* Phone */}
                        <div className="input-group">
                            <label className="input-label">Phone Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                            <div className="input-with-icon">
                                <Phone size={16} className="input-icon" />
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="+1 (555) 000-0000"
                                    value={form.phone}
                                    onChange={e => update('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-with-icon">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className={`input-field ${errors.password ? 'error' : ''}`}
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={e => update('password', e.target.value)}
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" className="input-toggle-pass" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.password && (
                                <>
                                    <div className="password-strength">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`strength-bar ${i <= strength ? strengthColor : ''}`} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: strength >= 3 ? '#10b981' : strength >= 2 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                                        {strengthLabel}
                                    </span>
                                </>
                            )}
                            {errors.password && <span className="input-error">{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="input-group">
                            <label className="input-label">Confirm Password</label>
                            <div className="input-with-icon">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Repeat your password"
                                    value={form.confirmPassword}
                                    onChange={e => update('confirmPassword', e.target.value)}
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" className="input-toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
                        </div>

                        {/* Terms */}
                        <label className="auth-terms">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                            <span>
                                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </span>
                        </label>
                        {errors.terms && <span className="input-error">{errors.terms}</span>}

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} />
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
