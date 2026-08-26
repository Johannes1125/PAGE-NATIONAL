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
import './org-login.css';
import { api } from "../lib/api-client";
import VersionUpdatesModal from "../components/VersionUpdatesModal";

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

export default function OrgLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formShake, setFormShake] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

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
      
      if (data.user.role !== 'organization') {
        gooeyToast.error("Access Denied: Not an institutional organization account.");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));
      
      gooeyToast.success("Login successful!");
      router.push('/org-dashboard');
    } catch (err: any) {
      gooeyToast.error(err.message || "Authentication failed. Please verify your credentials.");
      setErrors({ general: err.message || "Authentication failed." });
      setFormShake(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ol-container">
      <div className="ol-split">
        {/* ── LEFT PANEL (Branding & Copy) ── */}
        <div className="ol-left">
          <div className="ol-left-overlay" />
          <div className="ol-left-content">
            {/* Back button */}
            <Link href="/" className="ol-back-home" aria-label="Go back to home page">
              <ArrowLeft size={16} />
              <span>Back to Portal</span>
            </Link>

            <div className="ol-logo-badge">
              <div className="ol-logo-icon-wrap">
                <FontAwesomeIcon icon={faGraduationCap} className="ol-grad-icon" />
              </div>
              <span className="ol-logo-wordmark">PAGE</span>
            </div>

            <div className="ol-headline-wrap">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span variants={lineVariants} className="ol-headline-line">
                  Institutional
                </motion.span>
                <motion.span variants={lineVariants} className="ol-headline-line" style={{ fontWeight: 800 }}>
                  Console Portal.
                </motion.span>
              </motion.div>
            </div>

            <p className="ol-descriptor">
              Manage your institution's chapter, moderate member submissions, and oversee research cohorts.
            </p>

            {/* Role Pills */}
            <div className="ol-role-grid">
              {['Editor-in-Chief', 'Peer Reviewer', 'Content Manager', 'Contributor'].map((role) => (
                <span key={role} className="ol-role-pill">{role}</span>
              ))}
            </div>

            {/* Bottom tagline */}
            <p className="ol-tagline-bottom">
              ESTABLISHED 2026 &nbsp;·&nbsp; INSTITUTIONAL EXCELLENCE
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="ol-right"
          variants={rightPanelVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="ol-form-card"
            animate={formShake ? { x: [0, -9, 9, -9, 9, 0] } : {}}
            transition={{ duration: 0.4 }}
            onAnimationComplete={() => setFormShake(false)}
          >
            {/* Heading */}
            <div className="ol-form-header">
              <h2 className="ol-welcome">Welcome Back</h2>
              <p className="ol-subtitle">Access your organization dashboard</p>
            </div>

            {/* System Update Notice */}
            <div className="ol-notice">
              <AlertCircle size={15} className="ol-notice-icon" strokeWidth={2.5} />
              <div>
                <p className="ol-notice-title">New System Update</p>
                <p className="ol-notice-desc">
                  If this is your first time logging in since the semester update,
                  please verify your organizational MFA status.
                </p>
              </div>
            </div>

            {/* Email Field */}
            <div className="ol-field-group">
              <label htmlFor="ol-email" className="ol-label">Institutional Email</label>
              <div className={`ol-input-wrap ${errors.email ? 'ol-input-error' : ''}`}>
                <Mail size={16} className="ol-input-icon-left" strokeWidth={2} />
                <input
                  id="ol-email"
                  type="email"
                  className="ol-input"
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
                    className="ol-error-msg"
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
            <div className="ol-field-group">
              <label htmlFor="ol-password" className="ol-label">Password</label>
              <div className={`ol-input-wrap ${errors.password ? 'ol-input-error' : ''}`}>
                <Lock size={16} className="ol-input-icon-left" strokeWidth={2} />
                <input
                  id="ol-password"
                  type={showPassword ? 'text' : 'password'}
                  className="ol-input ol-input-has-right"
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
                  className="ol-eye-btn"
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
                    className="ol-error-msg"
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
            <div className="ol-remember-row">
              <label className="ol-remember-label" htmlFor="ol-remember">
                <input
                  id="ol-remember"
                  type="checkbox"
                  className="ol-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Keep me signed in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              id="ol-sign-in-btn"
              className="ol-signin-btn"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="ol-spinner" style={{ display: 'inline-block' }} />
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="ol-divider">
              <hr className="ol-divider-line" />
            </div>

            {/* Footer actions */}
            <div className="ol-footer">
              <p className="ol-footer-label">Need institutional access?</p>
              <div className="ol-footer-actions">
                <button className="ol-btn-secondary">Contact Support</button>
                <button className="ol-btn-primary">Request Access</button>
              </div>
            </div>

            {/* Version Updates */}
            <div className="ol-version-wrap">
              <button
                type="button"
                className="ol-version-btn"
                onClick={() => setIsVersionModalOpen(true)}
              >
                Version Updates (v0.3.0-dev)
              </button>
            </div>

          </motion.div>
        </motion.div>
      </div>

      <VersionUpdatesModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
      />
    </div>
  );
}