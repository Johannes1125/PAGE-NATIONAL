'use client';

import { useState } from "react";
import './org-login.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "../lib/fontawesome-icons";
import { faCheckCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'


export default function OrgLogin() {
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
              <p  className="login-tagline">Philippine Association for Graduate Education</p>

              {/* TEXT */}
              <div className="title-page">
                <h1 className="title">Organization Member Workspace</h1>
                <p className="subtext">
                    The definitive hub for scholarly excellence. Submit
                    journals, manage peer reviews, and curate
                    academic progress through our dedicated
                    member portal.
                </p>
              </div>

              {/* Features */}
              <div className="feature-container">
                <div className="feature-separation">
                    <div className="feature">
                        <h3 className="title-feature">Editor-in-Chief</h3>
                    </div>

                    <div className="feature">
                        <h3 className="title-feature">Peer Reviewer</h3>
                    </div>
                </div>

                <div className="feature-separation">
                    <div className="feature">
                        <h3 className="title-feature">Content Manager</h3>
                    </div>

                    <div className="feature">
                        <h3 className="title-feature">Contributor</h3>
                    </div>
                </div>
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
            <p className="subtitle">Enter your institutional credentials to access the workspace.</p>

            <div className="system-update">
                <div className="system-container">
                    <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />

                    <div className="title-text-system">
                        <h2 className="system-title">New System Update</h2>
                        <p className="system-desc">If this is your first time logging in since the semester update,
                            please verify your organizational MFA status.</p>
                    </div>
                </div>
            </div>

            <div className='login-form-container'>

              {/* EMAIL */}
              <div className="login-form">
                <label>EMAIL ADDRESS</label>
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
                <label htmlFor="rememberMe">Keep me signed in</label>
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
            </div>

            {/* SIGN UP */}
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