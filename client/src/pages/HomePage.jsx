import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Shield, Calendar, FileText, MessageSquare, Star,
    ChevronRight, Heart, Users, Award, Clock, ArrowRight,
    Stethoscope, Pill, Brain, Phone, Mail, MapPin, CheckCircle,
    Menu, X, Zap, TrendingUp
} from 'lucide-react';
import './HomePage.css';

const STATS = [
    { value: 50000, display: '50K+', label: 'Patients Served', icon: Users },
    { value: 200, display: '200+', label: 'Expert Doctors', icon: Stethoscope },
    { value: 98, display: '98%', label: 'Satisfaction Rate', icon: Star },
    { value: 24, display: '24/7', label: 'AI Support', icon: Brain },
];

const FEATURES = [
    {
        icon: Calendar,
        title: 'Smart Appointment Booking',
        desc: 'Book appointments with top specialists in seconds. Real-time availability, instant confirmation.',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
        icon: Pill,
        title: 'Digital Prescriptions',
        desc: 'Access your prescriptions digitally. View medicines, dosage, and instructions anytime.',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
        icon: FileText,
        title: 'Medical Records',
        desc: 'All your health history in one secure place. Share records with doctors instantly.',
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
        icon: Brain,
        title: 'AI Health Assistant',
        desc: 'Get instant answers to medicine queries, dosage information, and health guidance.',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        desc: 'Your medical data is encrypted and protected with enterprise-grade security.',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
    },
    {
        icon: Clock,
        title: '24/7 Availability',
        desc: 'Access healthcare services round the clock. Emergency support always available.',
        color: '#0d9488',
        bg: 'rgba(13, 148, 136, 0.1)',
    },
];

const DOCTORS = [
    { name: 'Dr. Sarah Mitchell', specialty: 'Cardiologist', rating: 4.9, patients: 1240, exp: '12 yrs', color: '#3b82f6' },
    { name: 'Dr. James Wilson', specialty: 'Neurologist', rating: 4.8, patients: 980, exp: '10 yrs', color: '#10b981' },
    { name: 'Dr. Priya Sharma', specialty: 'Pediatrician', rating: 4.9, patients: 1560, exp: '15 yrs', color: '#8b5cf6' },
    { name: 'Dr. Robert Chen', specialty: 'Orthopedist', rating: 4.7, patients: 870, exp: '8 yrs', color: '#f59e0b' },
];

const TESTIMONIALS = [
    {
        name: 'Emily Rodriguez',
        role: 'Patient',
        text: 'Medicare transformed how I manage my health. Booking appointments is so easy, and the AI chatbot helped me understand my medications perfectly.',
        rating: 5,
    },
    {
        name: 'Michael Thompson',
        role: 'Patient',
        text: 'The digital prescription system is a game-changer. I can access my medical history anytime, anywhere. Highly recommended!',
        rating: 5,
    },
    {
        name: 'Dr. Anita Patel',
        role: 'Cardiologist',
        text: 'As a doctor, Medicare has streamlined my workflow significantly. Patient management is now effortless and efficient.',
        rating: 5,
    },
];

const MARQUEE_ITEMS = [
    { icon: CheckCircle, text: 'HIPAA Compliant', color: '#10b981' },
    { icon: Shield, text: 'SSL Encrypted', color: '#3b82f6' },
    { icon: Award, text: 'ISO Certified', color: '#8b5cf6' },
    { icon: Star, text: '4.9 / 5 Rating', color: '#f59e0b' },
    { icon: Users, text: '50,000+ Patients', color: '#0d9488' },
    { icon: Zap, text: 'AI Powered', color: '#ef4444' },
    { icon: TrendingUp, text: '98% Satisfaction', color: '#3b82f6' },
    { icon: Heart, text: 'Trusted Care', color: '#ef4444' },
];

// Hook: count up animation
function useCountUp(target, duration = 1800, started = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, target, duration]);
    return count;
}

// Hook: IntersectionObserver trigger
function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

function StatItem({ stat, started }) {
    const count = useCountUp(stat.value, 1600, started);
    const display = stat.display.includes('%')
        ? `${count}%`
        : stat.display.includes('+')
            ? `${count.toLocaleString()}+`
            : stat.display;
    const Icon = stat.icon;
    return (
        <div className="stat-item">
            <div className="stat-icon"><Icon size={22} color="#2563eb" /></div>
            <div className="stat-value">{display}</div>
            <div className="stat-label">{stat.label}</div>
        </div>
    );
}

export default function HomePage() {
    const [navOpen, setNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Section refs for scroll-reveal
    const [statsRef, statsInView] = useInView(0.2);
    const [featuresRef, featuresInView] = useInView(0.1);
    const [doctorsRef, doctorsInView] = useInView(0.1);
    const [testimonialsRef, testimonialsInView] = useInView(0.1);
    const [ctaRef, ctaInView] = useInView(0.2);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="home-page">
            {/* Navbar */}
            <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="home-nav-inner">
                    <Link to="/" className="home-nav-logo">
                        <div className="home-nav-logo-icon">
                            <Activity size={18} color="white" />
                        </div>
                        <span>Medicare</span>
                    </Link>

                    <div className={`home-nav-links ${navOpen ? 'open' : ''}`}>
                        <a href="#features">Features</a>
                        <a href="#doctors">Doctors</a>
                        <a href="#testimonials">Reviews</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className="home-nav-actions">
                        <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                    </div>

                    <button className="home-nav-hamburger" onClick={() => setNavOpen(!navOpen)}>
                        {navOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="home-hero-wrapper">
                <section className="home-hero">
                    <div className="home-hero-bg">
                        <div className="hero-orb hero-orb-1" />
                        <div className="hero-orb hero-orb-2" />
                        <div className="hero-orb hero-orb-3" />
                        <div className="hero-grid" />
                    </div>

                    {/* ECG Line */}
                    <div className="hero-ecg-line">
                        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="ecg-svg">
                            <polyline
                                className="ecg-path"
                                points="0,30 100,30 130,30 145,5 155,55 165,5 175,55 185,30 200,30 300,30 330,30 345,5 355,55 365,5 375,55 385,30 400,30 500,30 530,30 545,5 555,55 565,5 575,55 585,30 600,30 700,30 730,30 745,5 755,55 765,5 775,55 785,30 800,30 900,30 930,30 945,5 955,55 965,5 975,55 985,30 1000,30 1100,30 1200,30"
                            />
                        </svg>
                    </div>

                    <div className="home-hero-content">
                        <div className="hero-badge">
                            <span className="status-dot online" />
                            <span>Trusted by 50,000+ patients worldwide</span>
                        </div>

                        <h1 className="hero-title">
                            Your Health,
                            <br />
                            <span className="gradient-text-hero">Reimagined.</span>
                        </h1>

                        <p className="hero-subtitle">
                            Medicare connects you with top doctors, manages your prescriptions,
                            and provides AI-powered health guidance — all in one seamless platform.
                        </p>

                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg hero-cta-btn">
                                Start Your Journey
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn hero-btn-outline btn-lg">
                                Sign In
                            </Link>
                        </div>

                        <div className="hero-trust">
                            <div className="hero-trust-avatars">
                                {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'].map((c, i) => (
                                    <div key={i} className="hero-trust-avatar" style={{ background: c, zIndex: 4 - i }}>
                                        {['A', 'B', 'C', 'D'][i]}
                                    </div>
                                ))}
                            </div>
                            <div className="hero-trust-text">
                                <div className="hero-trust-stars">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                                </div>
                                <span>4.9/5 from 12,000+ reviews</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Card */}
                    <div className="hero-card-wrapper">
                        <div className="hero-card-glow" />
                        <div className="hero-card">
                            <div className="hero-card-header">
                                <div className="hero-card-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>S</div>
                                <div>
                                    <div className="hero-card-name">Dr. Sarah Mitchell</div>
                                    <div className="hero-card-spec">Cardiologist • ⭐ 4.9</div>
                                </div>
                                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Available</span>
                            </div>
                            <div className="hero-card-slots">
                                <div className="hero-card-slots-title">Today's Available Slots</div>
                                <div className="hero-card-slot-grid">
                                    {['9:00 AM', '10:30 AM', '2:00 PM', '4:30 PM'].map((t, i) => (
                                        <div key={i} className={`hero-slot ${i === 1 ? 'selected' : ''}`}>{t}</div>
                                    ))}
                                </div>
                            </div>
                            <button className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
                                <Calendar size={16} />
                                Book Appointment
                            </button>
                        </div>

                        {/* Floating cards */}
                        <div className="hero-float-card hero-float-1">
                            <CheckCircle size={16} color="#10b981" />
                            <span>Appointment Confirmed!</span>
                        </div>
                        <div className="hero-float-card hero-float-2">
                            <Heart size={16} color="#ef4444" className="animate-heartbeat" />
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Heart Rate</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>72 BPM</div>
                            </div>
                        </div>

                        {/* New: AI assist float */}
                        <div className="hero-float-card hero-float-3">
                            <Brain size={16} color="#8b5cf6" />
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>AI Insight</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>All Vitals Normal</div>
                            </div>
                        </div>
                    </div>
                </section>
            </section>

            {/* Trust Marquee Strip */}
            <div className="trust-marquee-strip">
                <div className="trust-marquee-track">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div key={i} className="trust-marquee-item">
                                <Icon size={14} color={item.color} />
                                <span>{item.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <section className="home-stats" ref={statsRef}>
                <div className="home-container">
                    <div className={`stats-grid ${statsInView ? 'revealed' : ''}`}>
                        {STATS.map((stat, i) => (
                            <StatItem key={i} stat={stat} started={statsInView} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="home-features" id="features" ref={featuresRef}>
                <div className="home-container">
                    <div className={`section-header reveal-element ${featuresInView ? 'revealed' : ''}`}>
                        <div className="section-badge">Features</div>
                        <h2 className="section-title">Everything you need for <span className="gradient-text">better health</span></h2>
                        <p className="section-subtitle">A comprehensive platform designed to make healthcare accessible, efficient, and personalized.</p>
                    </div>

                    <div className="features-grid">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={i}
                                    className={`feature-card card reveal-element ${featuresInView ? 'revealed' : ''}`}
                                    style={{ transitionDelay: `${i * 80}ms` }}
                                >
                                    <div className="feature-card-accent" style={{ background: f.bg }} />
                                    <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="feature-title">{f.title}</h3>
                                    <p className="feature-desc">{f.desc}</p>
                                    <div className="feature-link" style={{ color: f.color }}>
                                        Learn more <ChevronRight size={14} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Doctors */}
            <section className="home-doctors" id="doctors" ref={doctorsRef}>
                <div className="home-container">
                    <div className={`section-header reveal-element ${doctorsInView ? 'revealed' : ''}`}>
                        <div className="section-badge">Our Team</div>
                        <h2 className="section-title">Meet our <span className="gradient-text">expert doctors</span></h2>
                        <p className="section-subtitle">Board-certified specialists committed to providing exceptional care.</p>
                    </div>

                    <div className="doctors-grid">
                        {DOCTORS.map((doc, i) => (
                            <div
                                key={i}
                                className={`doctor-card card reveal-element ${doctorsInView ? 'revealed' : ''}`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <div className="doctor-card-top-bar" style={{ background: `linear-gradient(135deg, ${doc.color}, ${doc.color}88)` }} />
                                <div className="doctor-avatar" style={{ background: `linear-gradient(135deg, ${doc.color}, ${doc.color}88)` }}>
                                    {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <h3 className="doctor-name">{doc.name}</h3>
                                <p className="doctor-spec">{doc.specialty}</p>
                                <div className="doctor-stats">
                                    <div className="doctor-stat">
                                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                        <span>{doc.rating}</span>
                                    </div>
                                    <div className="doctor-stat">
                                        <Users size={12} color="#64748b" />
                                        <span>{doc.patients.toLocaleString()}</span>
                                    </div>
                                    <div className="doctor-stat">
                                        <Award size={12} color="#64748b" />
                                        <span>{doc.exp}</span>
                                    </div>
                                </div>
                                <Link to="/register" className="btn btn-secondary btn-sm btn-full" style={{ marginTop: '12px' }}>
                                    Book Appointment
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="home-testimonials" id="testimonials" ref={testimonialsRef}>
                <div className="home-container">
                    <div className={`section-header reveal-element ${testimonialsInView ? 'revealed' : ''}`}>
                        <div className="section-badge">Reviews</div>
                        <h2 className="section-title">What our <span className="gradient-text">patients say</span></h2>
                    </div>

                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={i}
                                className={`testimonial-card card reveal-element ${testimonialsInView ? 'revealed' : ''}`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                <div className="testimonial-quote">"</div>
                                <div className="testimonial-stars">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                                    ))}
                                </div>
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar" style={{ background: `hsl(${i * 80 + 200}, 70%, 50%)` }}>
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="home-cta" ref={ctaRef}>
                <div className="home-container">
                    <div className={`cta-card reveal-element ${ctaInView ? 'revealed' : ''}`}>
                        <div className="cta-orb cta-orb-1" />
                        <div className="cta-orb cta-orb-2" />
                        <div className="cta-particles">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="cta-particle" style={{ animationDelay: `${i * 0.4}s`, left: `${10 + i * 15}%` }} />
                            ))}
                        </div>
                        <h2 className="cta-title">Ready to take control of your health?</h2>
                        <p className="cta-subtitle">Join thousands of patients who trust Medicare for their healthcare needs.</p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Create Free Account
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn cta-btn-outline btn-lg">
                                Sign In
                            </Link>
                        </div>
                        <div className="cta-live-indicator">
                            <span className="status-dot online" />
                            <span>247 patients joined this week</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer" id="contact">
                <div className="home-container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="home-nav-logo" style={{ marginBottom: '12px' }}>
                                <div className="home-nav-logo-icon">
                                    <Activity size={16} color="white" />
                                </div>
                                <span style={{ color: 'white', fontWeight: 800 }}>Medicare</span>
                            </div>
                            <p className="footer-desc">Your trusted healthcare management platform. Quality care, accessible to all.</p>
                            <div className="footer-contact">
                                <div className="footer-contact-item"><Phone size={14} /> +1 (800) MEDICARE</div>
                                <div className="footer-contact-item"><Mail size={14} /> support@medicare.com</div>
                                <div className="footer-contact-item"><MapPin size={14} /> New York, NY 10001</div>
                            </div>
                        </div>
                        <div className="footer-links-group">
                            <h4>Platform</h4>
                            <a href="#features">Features</a>
                            <a href="#doctors">Doctors</a>
                            <Link to="/login">Patient Portal</Link>
                            <Link to="/login">Doctor Portal</Link>
                        </div>
                        <div className="footer-links-group">
                            <h4>Support</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Contact Us</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span>© 2026 Medicare. All rights reserved.</span>
                        <span>Made with ❤️ for better healthcare</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
