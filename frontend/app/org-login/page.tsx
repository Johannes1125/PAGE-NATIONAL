'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '../lib/fontawesome-icons';
import './org-login.css';

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

export default function OrgLogin() {
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

    setErrors({});
    setIsLoading(true);

    // TODO: connect to API — POST /api/auth/org/login
    // Expected payload: { email, password, remember_me: rememberMe }
    // Expected response: { token, user: { id, name, role } }
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    router.push('/org-dashboard');
  };

  const features = [
    'Organization-Wide Access Control',
    'Journal Submission Management',
    'Peer Review Coordination Tools',
  ];

  return (
    <div className="ol-container">
      {/* ── SPLIT LAYOUT ── */}
      <div className="ol-split">

        {/* ── LEFT PANEL ── */}
        <div className="ol-left">
          <div className="ol-left-overlay" />

          <div className="ol-left-content">
            {/* Back to Home Button */}
            <motion.button
              className="ol-back-home"
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
              className="ol-logo-badge"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="ol-logo-icon-wrap">
                <FontAwesomeIcon icon={faGraduationCap} className="ol-grad-icon" />
              </div>
              <span className="ol-logo-wordmark">PAGE</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              className="ol-headline-wrap"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {['Organization', 'Member', 'Workspace'].map((word) => (
                <motion.span key={word} className="ol-headline-line" variants={lineVariants}>
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Descriptor */}
            <motion.p
              className="ol-descriptor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              The definitive hub for scholarly excellence. Submit journals, manage peer
              reviews, and curate academic progress through our dedicated organization portal.
            </motion.p>

            {/* Feature Bullets */}
            <div className="ol-checklist">
              {features.map((item, i) => (
                <motion.div
                  key={item}
                  className="ol-check-item"
                  custom={i}
                  variants={checkItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <CheckCircle size={18} className="ol-check-icon" strokeWidth={2.5} />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>

            {/* Role Pills */}
            <motion.div
              className="ol-role-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              {['Editor-in-Chief', 'Peer Reviewer', 'Content Manager', 'Contributor'].map((role) => (
                <span key={role} className="ol-role-pill">{role}</span>
              ))}
            </motion.div>

            {/* Bottom tagline */}
            <motion.p
              className="ol-tagline-bottom"
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

            {/* Remember + Forgot */}
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
              <a href="#" className="ol-forgot">Forgot Password?</a>
            </div>

            {/* Sign In Button */}
            <button
              id="ol-sign-in-btn"
              className="ol-signin-btn"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="ol-spinner" />
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

          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}