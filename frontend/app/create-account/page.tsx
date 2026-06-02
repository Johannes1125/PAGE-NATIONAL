'use client';

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../lib/api-client";
import "../member-login/member-login.css";

export default function CreateAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("member");
  const [university, setUniversity] = useState("");
  const [position, setPosition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email!");
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
      const data = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
        university: university || null,
        position: position || null,
      });

      toast.success("Account created successfully! Redirecting to login...");
      
      // Redirect to the appropriate login page based on role selection after 2 seconds
      setTimeout(() => {
        if (role === 'organization') {
          router.push('/org-login');
        } else {
          router.push('/member-login');
        }
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Email may already be in use.");
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
                <h1 className="title">Join PAGE Scholarly Network</h1>
                <p className="subtext">
                  Embark on your academic journey. Register to collaborate with other professors, share peer-reviewed articles, and publish breakthroughs.
                </p>
              </div>

              <div className="login-checklist">
                {[
                  "Secure Personal Account Setup",
                  "Verified Institutional Affiliation",
                  "Instant Research Sharing"
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
        <div className="login-right-side" style={{ overflowY: 'auto', padding: '40px 0' }}>
          <div className="login-right-container" style={{ padding: '0 20px' }}>

            <h2>Create Account</h2>
            <p className="subtitle" style={{ paddingBottom: '25px' }}>Register a new institutional profile</p>

            <div className='login-form-container' style={{ gap: '18px', paddingBottom: '20px' }}>

              {/* FULL NAME */}
              <div className="login-form">
                <label htmlFor="name">Full Name *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    placeholder="Dr. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="login-form">
                <label htmlFor="email">Institutional Email *</label>
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

              {/* ROLE SELECTION */}
              <div className="login-form">
                <label htmlFor="role">Platform Role *</label>
                <div className="input-wrapper">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="member">General Member (Academic / Professor)</option>
                    <option value="organization">Organization Representative (Graduate Council)</option>
                    <option value="reviewer">Peer Reviewer</option>
                  </select>
                </div>
              </div>

              {/* UNIVERSITY */}
              <div className="login-form">
                <label htmlFor="university">University / Affiliation</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="university"
                    placeholder="Gordon College / University of Santo Tomas"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </div>
              </div>

              {/* POSITION */}
              <div className="login-form">
                <label htmlFor="position">Position / Rank</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="position"
                    placeholder="Professor / Council Chair / Secretary"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="login-form">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
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
                <label htmlFor="passwordConfirmation">Confirm Password *</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="passwordConfirmation"
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                </div>
              </div>

            </div>

            {/* BUTTON */}
            <button className="login-btn" onClick={handleSignUp} disabled={isLoading} style={{ marginTop: '10px' }}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {/* DIVIDER */}
            <div className="divider">
              <hr />
              <span>OR</span>
              <hr />
            </div>

            {/* SIGN IN LINK */}
            <p className="sign-up">
              Already have an account? <Link href="/member-login">Sign In</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
