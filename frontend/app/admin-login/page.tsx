'use client';

import { useState } from "react";
import './admin-login.css';
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
                <div className="admin-portal">ADMIN PORTAL</div>
                <h1 className="title">System Administration Panel</h1>
              </div>

              {/* checklist */}
              <div className="login-checklist">
                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <div className="checklist-container">
                    <h3 className="title-container">Post Approval & Publishing</h3>
                    <p>Verify and curate scholarly contributions.</p>
                  </div>
                </div>

                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <div className="checklist-container">
                    <h3 className="title-container">User & Role Management</h3>
                    <p>Control institutional access and permissions.</p>
                  </div>
                </div>

                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <div className="checklist-container">
                    <h3 className="title-container">System-wide Content Control</h3>
                    <p>Oversee global metadata and taxonomies.</p>
                  </div>
                </div>

                <div className="login-check">
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                  <div className="checklist-container">
                    <h3 className="title-container">Message & Inquiry Management</h3>
                    <p>Monitor communications and official help desk.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right-side">
          <div className="login-right-container">
            
            <div className='login-form-container'>

              {/* EMAIL */}
              <div className="login-form">
                <label>ADMIN EMAIL</label>
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
                <label htmlFor="rememberMe">Remember this device</label>
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
            
          </div>
        </div>

      </div>
    </div>
  );
}