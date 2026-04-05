'use client';

import { useState } from "react";
import './member-login.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function MemberLogin() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
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
                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <p>Secure Institutional Access</p>
                </div>

                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <p>Peer-Reviewed Publication Tools</p>
                </div>

                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <p>Integrated Research Repositories</p>
                </div>
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
                <label>INSTITUTIONAL EMAIL</label>
                <div className="input-wrapper">
                  <input type="email" placeholder="name@university.edu" />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="login-form">
                <label>PASSWORD</label>

                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
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
            <button className="login-btn">Sign In</button>

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