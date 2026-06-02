'use client';

import { useState } from "react";
import './member-login.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRouter } from "next/navigation";
import { api } from "../lib/api-client";

export default function MemberLogin() {
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
      
      if (data.user.role !== 'member') {
        toast.error("Access Denied: Please use the appropriate organizational or admin login page.");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('page_user_token', data.token);
      localStorage.setItem('page_user_payload', JSON.stringify(data.user));
      
      toast.success("Login successful!");
      router.push('/');
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
              
              {/* ICON + TITLE */}
              <div className="icon-title">
                <div className="icon-bg">
                  <FontAwesomeIcon icon={faGraduationCap} className="graduation-icon" />
                </div>
                <h1 className="login-title">PAGE</h1>
              </div>

              {/* TEXT */}
              <div className="title-page">
                <h1 className="title">Advancing Graduate Education Excellence</h1>
                <p className="subtext">
                  The Academic Curator is a premier institutional portal designed to unify scholarly research, faculty collaboration, and graduate student development.
                </p>
              </div>

              {/* CHECKLIST */}
              <div className="login-checklist">
                {[
                  "Secure Institutional Access",
                  "Peer-Reviewed Publication Tools",
                  "Integrated Research Repositories"
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

            <h2>Welcome Back</h2>
            <p className="subtitle">Access your institutional dashboard</p>

            <div className='login-form-container'>

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
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              <div className='remember-me'>
                <span className="forgot"><a href="#">Forgot Password?</a></span>
              </div>
            </div>

            {/* BUTTON */}
            <button className="login-btn" onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* DIVIDER */}
            <div className="divider">
              <hr />
              <span>OR</span>
              <hr />
            </div>

            {/* SIGN UP */}
            <p className="sign-up">
              New to the platform? <a href="#">Create Account</a>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}