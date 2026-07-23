'use client';

import { useState, useEffect } from "react";
import './admin-login.css';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { faGraduationCap, faUserShield } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";
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

export default function OrgLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Keep isSubmitting active during navigation to prevent form re-enabling flash
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      notifyError(errorObj.message || "Authentication failed. Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Compact header shown only on small screens, replaces the left panel */}
      <div className="mobile-masthead">
        <div className="icon-bg">
          <FontAwesomeIcon icon={faGraduationCap} />
        </div>
        <div className="mobile-masthead-text">
          <h1 className="login-title">PAGE</h1>
          <p className="login-tagline">Philippine Association for Graduate Education</p>
        </div>
      </div>

      <div className="login-separation">

        {/* LEFT SIDE */}
        <div className="login-left-side">
          <FontAwesomeIcon icon={faGraduationCap} className="watermark-icon" />
          <div className="overlay">
            <div className="login-alignment">

              <div className="top-content">
                <div className="brand-block">
                  {/* ICON + TITLE */}
                  <div className="icon-title">
                    <div className="icon-bg">
                      <FontAwesomeIcon icon={faGraduationCap} className="graduation-icon" />
                    </div>
                    <h1 className="login-title">PAGE</h1>
                  </div>
                  <p className="login-tagline">Philippine Association for Graduate Education</p>
                </div>

                {/* TEXT */}
                <div className="title-page">
                  <div className="admin-portal">ADMIN PORTAL</div>
                  <h1 className="title">System Administration Panel</h1>
                </div>

                {/* STATS — fills the gap between headline and checklist */}
                <div className="stats-row">
                  <div className="stat-item">
                    <h4>120+</h4>
                    <p>Member Institutions</p>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <h4>3.2k</h4>
                    <p>Published Works</p>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <h4>24/7</h4>
                    <p>System Uptime</p>
                  </div>
                </div>
              </div>

              {/* CHECKLIST */}
              <div className="login-checklist">
                {[
                  { title: "Post Approval & Publishing", desc: "Verify and curate scholarly contributions." },
                  { title: "User & Role Management", desc: "Control institutional access and permissions." },
                  { title: "System-wide Content Control", desc: "Oversee global metadata and taxonomies." },
                  { title: "Message & Inquiry Management", desc: "Monitor communications and official help desk." }
                ].map((item, index) => (
                  <div className="login-check" key={index}>
                    <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                    <div className="checklist-container">
                      <h3 className="title-container">{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right-side">
          <div className="login-right-container">

            <div className="icon-header">
              <FontAwesomeIcon icon={faUserShield} className="shield-icon" />
              <h3 className="Admin-title">Admin Access</h3>
              <p className="admin-subtext">Sign in to manage the PAGE system</p>
            </div>

            <form onSubmit={handleSignIn}>
              <div className="login-form-container">

                {/* EMAIL */}
                <div className="login-form">
                  <label htmlFor="adminEmail">ADMIN EMAIL</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="adminEmail"
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="login-form">
                  <label htmlFor="adminPassword">PASSWORD</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="adminPassword"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="eye-icon"
                      onClick={() => !isSubmitting && setShowPassword(prev => !prev)}
                    />
                  </div>
                </div>

              </div>

              {/* REMEMBER ME */}
              <div className="remember-forgot">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="checkbox"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="rememberMe">Remember this device</label>
                </div>
              </div>

              {/* BUTTON */}
              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="divider">
              <hr />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}