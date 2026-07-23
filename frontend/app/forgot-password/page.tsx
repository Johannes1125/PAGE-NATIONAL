'use client';

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faArrowLeft, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import "../member-login/member-login.css";

export default function ForgotPasswordPage() {
  return (
    <div className="ml-container">
      <div className="ml-split">
        {/* LEFT PANEL */}
        <div className="ml-left">
          <div className="ml-left-overlay" />
          <div className="ml-left-content">

            <Link href="/" className="ml-back-home" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Home</span>
            </Link>

            <div className="ml-logo-badge">
              <div className="ml-logo-icon-wrap">
                <FontAwesomeIcon icon={faGraduationCap} className="ml-grad-icon" />
              </div>
              <span className="ml-logo-wordmark">PAGE</span>
            </div>

            <div className="ml-headline-wrap">
              <span className="ml-headline-line">Self-Service Reset</span>
              <span className="ml-headline-line" style={{ fontWeight: 800 }}>Unavailable</span>
            </div>

            <p className="ml-descriptor">
              Self-service password recovery has been disabled on the PAGE platform. Please contact your institutional administrator or system support to reset your account credentials.
            </p>

            <p className="ml-tagline-bottom">Philippine Association for Graduate Education</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="ml-right">
          <div className="ml-form-card" style={{ textAlign: 'center', padding: '48px 28px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: '28px',
                marginBottom: '24px'
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>

            <h1 className="ml-welcome" style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px' }}>
              Feature Unavailable
            </h1>
            <p className="ml-subtitle" style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
              Self-service password recovery is not available. If you require assistance with your account, please reach out to system support or your institutional administrator.
            </p>

            <Link
              href="/"
              className="ml-signin-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                height: '48px',
                padding: '0 24px',
                fontWeight: 600
              }}
            >
              Return to Portal Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}