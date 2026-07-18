'use client';

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import {
  faCheckCircle,
  faEye,
  faEyeSlash,
  faEnvelopeCircleCheck,
  faArrowLeft,
  faEnvelope,
  faLock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../lib/api-client";
import "../member-login/member-login.css";

export default function ForgotPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isTokenDispatched, setIsTokenDispatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestLink = async () => {
    if (!email) {
      toast.error("Please enter your email address!");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email!");
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post('/forgot-password', { email });
      toast.success(data.message || "Simulated reset token generated successfully!");
      setIsTokenDispatched(true);
    } catch (err: any) {
      toast.error(err.message || "Email address not found in the PAGE registry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !passwordConfirmation) {
      toast.error("Please fill in all password fields!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post('/reset-password', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success(data.message || "Password updated! Redirecting to login...");
      setTimeout(() => {
        router.push('/member-login');
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="ml-split">

        {/* LEFT PANEL */}
        <div className="ml-left">
          <div className="ml-left-overlay" />
          <div className="ml-left-content">

            <button type="button" className="ml-back-home" onClick={() => router.push('/')}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Home
            </button>

            <div className="ml-logo-badge">
              <div className="ml-logo-icon-wrap">
                <FontAwesomeIcon icon={faGraduationCap} className="ml-grad-icon" />
              </div>
              <span className="ml-logo-wordmark">PAGE</span>
            </div>

            <div className="ml-headline-wrap">
              <span className="ml-headline-line">Secure Account</span>
              <span className="ml-headline-line">Recovery</span>
            </div>

            <p className="ml-descriptor">
              Reset your password securely. PAGE uses secure cryptographic hashing to ensure
              your institutional credential records remain private and shielded.
            </p>

            <div className="ml-checklist">
              {[
                "Secure Multi-Factor Validation",
                "Encrypted Password Updates",
                "Immediate Account Reactivation",
              ].map((item, index) => (
                <div className="ml-check-item" key={index}>
                  <FontAwesomeIcon icon={faCheckCircle} className="ml-check-icon" />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <p className="ml-tagline-bottom">Philippine Association for Graduate Education</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="ml-right">
          <div className="ml-form-card">

            {!isTokenDispatched ? (
              <>
                <div className="ml-form-header">
                  <h1 className="ml-welcome">Recover Password</h1>
                  <p className="ml-subtitle">Enter your email address to receive a simulated reset link</p>
                </div>

                {/* EMAIL */}
                <div className="ml-field-group">
                  <label className="ml-label" htmlFor="email">Institutional Email</label>
                  <div className="ml-input-wrap">
                    <FontAwesomeIcon icon={faEnvelope} className="ml-input-icon-left" />
                    <input
                      type="email"
                      id="email"
                      className="ml-input"
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <button className="ml-signin-btn" onClick={handleRequestLink} disabled={isLoading}>
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="ml-spinner" />}
                  {isLoading ? "Validating Account..." : "Send Reset Link"}
                </button>
              </>
            ) : (
              <>
                <div className="ml-reset-success">
                  <FontAwesomeIcon icon={faEnvelopeCircleCheck} className="ml-reset-success-icon" />
                  <h3 className="ml-reset-success-title">Reset Link Dispatched</h3>
                  <p className="ml-reset-success-text">
                    A secure password reset authorization for <strong>{email}</strong> has been
                    simulated. Enter your new password below to finalize.
                  </p>
                </div>

                <div className="ml-form-header">
                  <h1 className="ml-welcome">Set New Password</h1>
                  <p className="ml-subtitle">Enter a new secure password for your profile</p>
                </div>

                {/* NEW PASSWORD */}
                <div className="ml-field-group">
                  <label className="ml-label" htmlFor="newPassword">New Password</label>
                  <div className="ml-input-wrap">
                    <FontAwesomeIcon icon={faLock} className="ml-input-icon-left" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      className="ml-input ml-input-has-right"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ml-eye-btn"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="ml-field-group">
                  <label className="ml-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="ml-input-wrap">
                    <FontAwesomeIcon icon={faLock} className="ml-input-icon-left" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="ml-input"
                      placeholder="••••••••"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <button className="ml-signin-btn" onClick={handleResetPassword} disabled={isLoading}>
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="ml-spinner" />}
                  {isLoading ? "Updating Password..." : "Reset Password"}
                </button>
              </>
            )}

            {/* DIVIDER */}
            <div className="ml-divider">
              <hr className="ml-divider-line" />
            </div>

            {/* SIGN IN LINK */}
            <p className="ml-create-account">
              Remember your password? <Link href="/member-login" className="ml-create-link">Sign In</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}