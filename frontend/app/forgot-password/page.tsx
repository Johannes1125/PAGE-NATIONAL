'use client';

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash, faEnvelopeCircleCheck } from "@fortawesome/free-solid-svg-icons";
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
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="login-separation">

        {/* LEFT SIDE */}
        <div className="login-left-side">
          <div className="overlay">
            <div className="login-alignment">
              
              <div className="icon-title">
                <div className="icon-bg">
                  <FontAwesomeIcon icon={faGraduationCap} className="graduation-icon" />
                </div>
                <h1 className="login-title">PAGE</h1>
              </div>

              <div className="title-page">
                <h1 className="title">Secure Account Recovery</h1>
                <p className="subtext">
                  Reset your password securely. PAGE uses secure cryptographic hashing to ensure your institutional credential records remain private and shielded.
                </p>
              </div>

              <div className="login-checklist">
                {[
                  "Secure Multi-Factor Validation",
                  "Encrypted Password Updates",
                  "Immediate Account Reactivation"
                ].map((item, index) => (
                  <div className="login-check" key={index}>
                    <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right-side">
          <div className="login-right-container">

            {!isTokenDispatched ? (
              <>
                <h2>Recover Password</h2>
                <p className="subtitle">Enter your email address to receive a simulated reset link</p>

                <div className='login-form-container' style={{ gap: '20px', paddingBottom: '20px' }}>
                  {/* EMAIL */}
                  <div className="login-form">
                    <label htmlFor="email">INSTITUTIONAL EMAIL</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="email"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* BUTTON */}
                <button className="login-btn" onClick={handleRequestLink} disabled={isLoading}>
                  {isLoading ? "Validating Account..." : "Send Reset Link"}
                </button>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '25px', padding: '15px', backgroundColor: '#eef6ff', borderRadius: '8px', border: '1px solid #cce3ff' }}>
                  <FontAwesomeIcon icon={faEnvelopeCircleCheck} style={{ fontSize: '32px', color: '#1e538e', marginBottom: '10px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#143152' }}>Reset Link Dispatched</h3>
                  <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                    A secure password reset authorization for <strong>{email}</strong> has been simulated. Enter your new password below to finalize.
                  </p>
                </div>

                <h2>Set New Password</h2>
                <p className="subtitle">Enter a new secure password for your profile</p>

                <div className='login-form-container' style={{ gap: '20px', paddingBottom: '20px' }}>
                  {/* PASSWORD */}
                  <div className="login-form">
                    <label htmlFor="newPassword">NEW PASSWORD</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="eye-icon"
                        onClick={() => setShowPassword(prev => !prev)}
                      />
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="login-form">
                    <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="••••••••"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* BUTTON */}
                <button className="login-btn" onClick={handleResetPassword} disabled={isLoading}>
                  {isLoading ? "Updating Password..." : "Reset Password"}
                </button>
              </>
            )}

            {/* DIVIDER */}
            <div className="divider">
              <hr />
            </div>

            {/* SIGN IN LINK */}
            <p className="sign-up">
              Remember your password? <Link href="/member-login">Sign In</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
