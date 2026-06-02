'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '../lib/fontawesome-icons';
import './member-login.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const lineVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const checkItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: 0.6 + i * 0.12 },
  }),
};

const rightPanelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../lib/api-client";

export default function MemberLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email!");
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post('/login', { email, password });
      
      if (data.user.role !== 'member') {
        toast.error("Access Denied: Please use the appropriate organizational or admin login page.");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));
      
      toast.success("Login successful!");
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
=======
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formShake, setFormShake] = useState(false);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid institutional email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    return newErrors;
>>>>>>> dev
  };

  const handleSignIn = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormShake(true);
      return;
    }

    setErrors({});
    setIsLoading(true);

    // TODO: connect to API — POST /api/auth/member/login
    // Expected payload: { email, password, remember_me: rememberMe }
    // Expected response: { token, user: { id, name, role } }
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    router.push('/member-dashboard');
  };

  const features = [
    'Secure Institutional Access',
    'Peer-Reviewed Publication Tools',
    'Integrated Research Repositories',
  ];

  return (
    <div className="ml-container">
      {/* ── SPLIT LAYOUT ── */}
      <div className="ml-split">

        {/* ── LEFT PANEL ── */}
        <div className="ml-left">
          <div className="ml-left-overlay" />

          <div className="ml-left-content">
            {/* Back to Home Button */}
            <motion.button
              className="ml-back-home"
              onClick={() => router.push('/')}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span>Back to Home</span>
            </motion.button>

            {/* Logo */}
            <motion.div
              className="ml-logo-badge"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="ml-logo-icon-wrap">
                <FontAwesomeIcon icon={faGraduationCap} className="ml-grad-icon" />
              </div>
              <span className="ml-logo-wordmark">PAGE</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              className="ml-headline-wrap"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {['Advancing', 'Graduate', 'Education', 'Excellence'].map((word) => (
                <motion.span key={word} className="ml-headline-line" variants={lineVariants}>
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Descriptor */}
            <motion.p
              className="ml-descriptor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              The Academic Curator is a premier institutional portal designed to unify
              scholarly research, faculty collaboration, and graduate student development.
            </motion.p>

            {/* Feature Bullets */}
            <div className="ml-checklist">
              {features.map((item, i) => (
                <motion.div
                  key={item}
                  className="ml-check-item"
                  custom={i}
                  variants={checkItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <CheckCircle size={18} className="ml-check-icon" strokeWidth={2.5} />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>

            {/* Bottom tagline */}
            <motion.p
              className="ml-tagline-bottom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              ESTABLISHED 2026 &nbsp;·&nbsp; INSTITUTIONAL EXCELLENCE
            </motion.p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="ml-right"
          variants={rightPanelVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="ml-form-card"
            animate={formShake ? { x: [0, -9, 9, -9, 9, 0] } : {}}
            transition={{ duration: 0.4 }}
            onAnimationComplete={() => setFormShake(false)}
          >
            {/* Heading */}
            <div className="ml-form-header">
              <h2 className="ml-welcome">Welcome Back</h2>
              <p className="ml-subtitle">Access your institutional dashboard</p>
            </div>

<<<<<<< HEAD
            {/* REMEMBER + FORGOT */}
            <div className='remember-forgot'>
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" className='checkbox' />
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              <div className='remember-me'>
                <span className="forgot"><Link href="/forgot-password">Forgot Password?</Link></span>
=======
            {/* Email Field */}
            <div className="ml-field-group">
              <label htmlFor="ml-email" className="ml-label">Institutional Email</label>
              <div className={`ml-input-wrap ${errors.email ? 'ml-input-error' : ''}`}>
                <Mail size={16} className="ml-input-icon-left" strokeWidth={2} />
                <input
                  id="ml-email"
                  type="email"
                  className="ml-input"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                />
>>>>>>> dev
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="ml-error-msg"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle size={12} strokeWidth={2.5} />
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

<<<<<<< HEAD
            {/* BUTTON */}
            <button className="login-btn" onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
=======
            {/* Password Field */}
            <div className="ml-field-group">
              <label htmlFor="ml-password" className="ml-label">Password</label>
              <div className={`ml-input-wrap ${errors.password ? 'ml-input-error' : ''}`}>
                <Lock size={16} className="ml-input-icon-left" strokeWidth={2} />
                <input
                  id="ml-password"
                  type={showPassword ? 'text' : 'password'}
                  className="ml-input ml-input-has-right"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="ml-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff size={16} strokeWidth={2} />
                    : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="ml-error-msg"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle size={12} strokeWidth={2.5} />
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember + Forgot */}
            <div className="ml-remember-row">
              <label className="ml-remember-label" htmlFor="ml-remember">
                <input
                  id="ml-remember"
                  type="checkbox"
                  className="ml-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="ml-forgot">Forgot Password?</a>
            </div>

            {/* Sign In Button */}
            <button
              id="ml-sign-in-btn"
              className="ml-signin-btn"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="ml-spinner" />
              ) : (
                'Sign In'
              )}
>>>>>>> dev
            </button>

            {/* Divider */}
            <div className="ml-divider">
              <hr className="ml-divider-line" />
              <span className="ml-divider-text">OR</span>
              <hr className="ml-divider-line" />
            </div>

<<<<<<< HEAD
            {/* SIGN UP */}
            <p className="sign-up">
              New to the platform? <Link href="/create-account">Create Account</Link>
=======
            {/* Create Account */}
            <p className="ml-create-account">
              New to the platform?{' '}
              <a href="#" className="ml-create-link">Create Account</a>
>>>>>>> dev
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}