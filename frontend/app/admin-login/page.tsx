'use client';

import { useState, useEffect } from "react";
import './admin-login.css';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { faGraduationCap, faUserShield } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { api } from "../lib/api-client";

export default function OrgLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("page_user_token");
    localStorage.removeItem("page_user_payload");
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.post('/login', { email, password });
      
      if (data.user.role !== 'admin') {
        toast.error("Access Denied: Not an administrator account.");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));
      
      toast.success("Login successful!");
      router.push('/admin-dashboard');
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Invalid email or password.");
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

              {/* ICON + TITLE */}
              <div className="icon-title">
                <div className="icon-bg">
                  <FontAwesomeIcon icon={faGraduationCap} className="graduation-icon" />
                </div>
                <h1 className="login-title">PAGE</h1>
              </div>
              <p className="login-tagline">Philippine Association for Graduate Education</p>

              {/* TEXT */}
              <div className="title-page">
                <div className="admin-portal">ADMIN PORTAL</div>
                <h1 className="title">System Administration Panel</h1>
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
            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" className="checkbox" />
                <label htmlFor="rememberMe">Remember this device</label>
              </div>
              <div className="remember-me">
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

            <div className="arrow-return">
              <FontAwesomeIcon icon={faArrowLeft} className="arrow-icon" />
              <p 
                className="return-page"
                onClick={() => router.push('/member-login')}
                style={{ cursor: 'pointer' }}
              >
                Return to General Login
              </p>  
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}