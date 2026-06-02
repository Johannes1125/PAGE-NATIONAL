'use client';

import { useState } from "react";
import './org-login.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../lib/api-client";

export default function OrgLogin() {
  const [showPassword, setShowPassword] = useState(false);
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
      
      if (data.user.role !== 'organization') {
        toast.error("Access Denied: Not an institutional organization account.");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));
      
      toast.success("Login successful!");
      router.push('/org-dashboard');
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Please verify your credentials.");
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
              <p className="login-tagline">Philippine Association for Graduate Education</p>

              <div className="title-page">
                <h1 className="title">Organization Member Workspace</h1>
                <p className="subtext">
                  The definitive hub for scholarly excellence. Submit journals, manage peer reviews, and curate academic progress through our dedicated member portal.
                </p>
              </div>

              <div className="feature-container">
                {[
                  ["Editor-in-Chief", "Peer Reviewer"],
                  ["Content Manager", "Contributor"]
                ].map((row, i) => (
                  <div className="feature-separation" key={i}>
                    {row.map((role, j) => (
                      <div className="feature" key={j}>
                        <h3 className="title-feature">{role}</h3>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="banner">
                <div className="banner-content">
                  <span className="left-text">ESTABLISHED 2026</span>
                  <span className="divider-banner"></span>
                  <span className="right-text">INSTITUTIONAL EXCELLENCE</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right-side">
          <div className="login-right-container">

            <h2>Member Login</h2>
            <p className="subtitle">
              Enter your institutional credentials to access the workspace.
            </p>

            <div className="system-update">
              <div className="system-container">
                <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />
                <div className="title-text-system">
                  <h2 className="system-title">New System Update</h2>
                  <p className="system-desc">
                    If this is your first time logging in since the semester update,
                    please verify your organizational MFA status.
                  </p>
                </div>
              </div>
            </div>

            <div className='login-form-container'>

              {/* EMAIL */}
              <div className="login-form">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="login-form">
                <label htmlFor="password">PASSWORD</label>

                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="eye-icon"
                    onClick={() => setShowPassword(prev => !prev)}
                  />
                </div>
              </div>

            </div>

            {/* REMEMBER + FORGOT */}
            <div className='remember-forgot'>
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" className='checkbox' />
                <label htmlFor="rememberMe">Keep me signed in</label>
              </div>

              <div className='remember-me'>
                <span className="forgot"><Link href="/forgot-password">Forgot Password?</Link></span>
              </div>
            </div>

            {/* BUTTON */}
            <button className="login-btn" onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* DIVIDER */}
            <div className="divider">
              <hr />
            </div>

            {/* FOOTER */}
            <div className="footer-right-side">
              <label className="label-access">Need institutional access?</label>

              <div className="action-btns">
                <button className="contact-support">Contact Support</button>
                <button className="req-access">Request Access</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}