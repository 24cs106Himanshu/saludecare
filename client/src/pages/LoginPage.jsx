import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Activity, Eye, EyeOff, Mail, Lock, User, Stethoscope, Shield,
    ArrowRight, CheckCircle, Heart
} from 'lucide-react';
import './AuthPages.css';

const ROLES = [
    { id: 'patient', label: 'Patient', icon: User, desc: 'Book appointments & manage health', color: '#3b82f6' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients & appointments', color: '#10b981' },
    { id: 'admin', label: 'Admin', icon: Shield, desc: 'System administration', color: '#8b5cf6' },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        const result = await login(email, password);
        if (result.success) {
            const userRole = result.user?.role || role;
            toast.success(`Welcome back! Signed in as ${userRole}`);
            navigate(`/${userRole}`);
        } else {
            toast.error(result.message || 'Invalid credentials. Please try again.');
        }
    };

    const selectedRole = ROLES.find(r => r.id === role);

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
                            Your health journey<br />
                            <span className="gradient-text-hero">starts here.</span>
                        </h2>
                        <p className="auth-left-subtitle">
                            Access your personalized healthcare dashboard, book appointments with top specialists, and manage your health records securely.
                        </p>
                    </div>

                    <div className="auth-features">
                        {[
                            'Book appointments in seconds',
                            'Access prescriptions digitally',
                            'AI-powered health assistant',
                            'Secure medical records',
                        ].map((f, i) => (
                            <div key={i} className="auth-feature-item">
                                <CheckCircle size={16} color="#2dd4bf" />
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>

                    <div className="auth-left-stats">
                        <div className="auth-stat">
                            <div className="auth-stat-value">50K+</div>
                            <div className="auth-stat-label">Patients</div>
                        </div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat">
                            <div className="auth-stat-value">200+</div>
                            <div className="auth-stat-label">Doctors</div>
                        </div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat">
                            <div className="auth-stat-value">98%</div>
                            <div className="auth-stat-label">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Welcome back</h1>
                        <p className="auth-form-subtitle">Sign in to your Medicare account</p>
                    </div>

                    {/* Role Selector */}
                    <div className="auth-role-selector">
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            return (
                                <button
                                    key={r.id}
                                    className={`auth-role-btn ${role === r.id ? 'active' : ''}`}
                                    onClick={() => setRole(r.id)}
                                    style={role === r.id ? { borderColor: r.color, background: `${r.color}10` } : {}}
                                >
                                    <Icon size={16} color={role === r.id ? r.color : '#94a3b8'} />
                                    <span style={role === r.id ? { color: r.color } : {}}>{r.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {selectedRole && (
                        <div className="auth-role-desc">
                            <selectedRole.icon size={14} color={selectedRole.color} />
                            <span>{selectedRole.desc}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        {/* Email */}
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    className={`input-field ${errors.email ? 'error' : ''}`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <span className="input-error">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-with-icon">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className={`input-field ${errors.password ? 'error' : ''}`}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    className="input-toggle-pass"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <span className="input-error">{errors.password}</span>}
                        </div>

                        <div className="auth-form-options">
                            <label className="auth-remember">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="auth-forgot">Forgot password?</a>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="divider">or continue with</div>

                        <div className="auth-social">
                            <button type="button" className="auth-social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button type="button" className="auth-social-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </form>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/register">Create one free</Link>
                    </p>

                    <div className="auth-demo-hint" style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', marginTop: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#166534', marginBottom: 8 }}>🧪 Demo Credentials</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <button
                                type="button"
                                onClick={() => { setEmail('patient@medicare.com'); setPassword('patient123'); setRole('patient'); }}
                                style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', color: '#1d4ed8' }}
                            >
                                👤 <strong>Patient:</strong> patient@medicare.com / patient123
                            </button>
                            <button
                                type="button"
                                onClick={() => { setEmail('doctor@medicare.com'); setPassword('doctor123'); setRole('doctor'); }}
                                style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', color: '#166534' }}
                            >
                                👨‍⚕️ <strong>Doctor:</strong> doctor@medicare.com / doctor123
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
