'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import './admin-login.css';
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Link from "next/link";
import {
  faEye,
  faEyeSlash,
  faSpinner,
  faEnvelope,
  faLock,
  faArrowRight,
  faArrowLeft,
  faShieldAlt,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { api, AuthResponse } from "../lib/api-client";

const notifyError = (msg: string) => {
  if (typeof gooeyToast !== "undefined" && gooeyToast.error) {
    gooeyToast.error(msg);
  } else {
    toast.error(msg);
  }
};

const notifySuccess = (msg: string) => {
  if (typeof gooeyToast !== "undefined" && gooeyToast.success) {
    gooeyToast.success(msg);
  } else {
    toast.success(msg);
  }
};

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("page_user_token");
    localStorage.removeItem("page_user_payload");
  }, []);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !password) {
      notifyError("Please fill in all fields!");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.post<AuthResponse>('/login', { email: email.trim(), password });

      if (data.user.role !== 'admin') {
        notifyError("Access Denied: Not an administrator account.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));

      notifySuccess("Login successful!");
      router.push('/admin-dashboard');
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      notifyError(errorObj.message || "Authentication failed. Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="al-page">
        {/* Back to Home Button */}
        <Link href="/" className="al-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="al-back-icon" />
          <span>Back to Home</span>
        </Link>

        {/* ── LEFT PANEL ── */}
        <div className="al-left">
        {/* Corner brackets */}
        <span className="al-corner al-corner--tl" />
        <span className="al-corner al-corner--br" />

        {/* Watermark seal */}
        <div className="al-watermark" aria-hidden="true">
          <Image
            src="/PAGE-favicon.png"
            alt=""
            width={900}
            height={900}
            className="al-watermark-img"
          />
        </div>

        <div className="al-left-inner">
          {/* Logo + brand */}
          <div className="al-brand">
            <div className="al-logo-ring">
              <Image
                src="/PAGE-favicon.png"
                alt="PAGE seal"
                width={200}
                height={200}
                className="al-logo-img"
              />
            </div>
            <h1 className="al-org-name">PAGE</h1>
            <p className="al-org-full">
              Philippine Association for<br />Graduate Education
            </p>
            <div className="al-gold-rule" />
            <span className="al-portal-badge">ADMIN PORTAL</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="al-right">
        {/* Card */}
        <div className="al-card">

          {/* Admin icon circle */}
          <div className="al-card-icon-wrap">
          <FontAwesomeIcon icon={faUserShield} className="al-card-icon" />
          </div>

          <h2 className="al-card-title">Admin Access</h2>
          <p className="al-card-sub">Sign in to manage the PAGE system</p>

          <form onSubmit={handleSignIn} className="al-form" noValidate>

            {/* Email */}
            <div className="al-field">
              <label htmlFor="adminEmail" className="al-label">ADMIN EMAIL</label>
              <div className="al-input-wrap">
                <FontAwesomeIcon icon={faEnvelope} className="al-input-icon" />
                <input
                  type="email"
                  id="adminEmail"
                  className="al-input"
                  placeholder="izyoboitoshi@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="al-field">
              <label htmlFor="adminPassword" className="al-label">PASSWORD</label>
              <div className="al-input-wrap">
                <FontAwesomeIcon icon={faLock} className="al-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="adminPassword"
                  className="al-input al-input--pw"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-eye-btn"
                  onClick={() => !isSubmitting && setShowPassword(prev => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Remember device */}
            <div className="al-row">
              <label className="al-remember">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  className="al-checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="al-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Security note */}
        <div className="al-security-note">
          <FontAwesomeIcon icon={faShieldAlt} className="al-sec-icon" />
          <span>Secure access. Trusted by PAGE administrators.</span>
        </div>
      </div>
    </div>
    </>
  );
}