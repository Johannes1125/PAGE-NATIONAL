'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '../lib/fontawesome-icons';
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import './member-login.css';
import { api } from "../lib/api-client";

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
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' as any } },
};

const checkItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut' as any, delay: 0.6 + i * 0.12 },
  }),
};

const rightPanelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as any, delay: 0.2 } },
};

export default function MemberLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
  };

  const handleSignIn = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormShake(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post('/login', { email, password });
      
      if (data.user.role !== 'member') {
        gooeyToast.error("Access Denied: Please use the appropriate organizational or admin login page.");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));
      
      gooeyToast.success("Login successful!");
      router.push('/');
    } catch (err: any) {
      gooeyToast.error(err.message || "Authentication failed. Please verify your credentials.");
      setErrors({ general: err.message || "Authentication failed." });
      setFormShake(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-container">
      <div className="ml-split">
        {/* ── LEFT PANEL (Branding & Copy) ── */}
        <div className="ml-left">
          <div className="ml-left-overlay" />
          <div className="ml-left-content">
            {/* Back button */}
            <Link href="/" className="ml-back-home" aria-label="Go back to home page">
              <ArrowLeft size={16} />
              <span>Back to Portal</span>
            </Link>

            <div className="ml-logo-badge">
              <div className="ml-logo-icon-wrap">
                <FontAwesomeIcon icon={faGraduationCap} className="ml-grad-icon" />
              </div>
              <span className="ml-logo-wordmark">PAGE</span>
            </div>

            <div className="ml-headline-wrap">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span variants={lineVariants} className="ml-headline-line">
                  Expanding Horizons in
                </motion.span>
                <motion.span variants={lineVariants} className="ml-headline-line" style={{ fontWeight: 800 }}>
                  Graduate Education.
                </motion.span>
              </motion.div>
            </div>

            <p className="ml-descriptor">
              Join a nationwide community of scholars, researchers, and educational pioneers.
            </p>

            {/* Micro value props */}
            <div className="ml-checklist">
              {[
                'Access peer-reviewed research materials and archives',
                'Connect with academic cohorts and organizations',
                'Participate in national development programs',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={checkItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="ml-check-item"
                >
                  <CheckCircle size={16} className="ml-check-icon" strokeWidth={2.5} />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>

            <p className="ml-tagline-bottom">
              ESTABLISHED 2026 &nbsp;·&nbsp; INSTITUTIONAL EXCELLENCE
            </p>
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

            {/* Remember */}
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
            </button>

            {/* Divider */}
            <div className="ml-divider">
              <hr className="ml-divider-line" />
              <span className="ml-divider-text">OR</span>
              <hr className="ml-divider-line" />
            </div>

            {/* Create Account */}
            <p className="ml-create-account">
              New to the platform?{' '}
              <Link href="/create-account" className="ml-create-link">Create Account</Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}