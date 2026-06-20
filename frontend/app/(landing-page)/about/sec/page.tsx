"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, FileText, Award, Calendar, CheckCircle } from "lucide-react";
import "../about-page.css";

// ── Mock SEC Data ─────────────────────────────────────────────────────────
const SEC_DETAILS = {
  companyName: "PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION PHILIPPINES, (PAGE) INC.",
  registrationNumber: "2024090169660-00",
  dateRegistered: "September 1, 2024",
  status: "Active / Registered",
  type: "Non-Stock, Non-Profit Corporation",
  signatory: "Emilio B. Aquino (Securities and Exchange Commission Chairperson)",
};

export default function SecRegistrationPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main style={{ minHeight: "100vh", background: "#060b13", paddingBottom: "80px" }}>
        
        {/* Hero Banner */}
        <section className="about-hero" style={{ padding: "120px 0 60px" }}>
          <div className="container">
            <div className="about-hero__breadcrumb">
              <Link href="/" className="about-hero__breadcrumb-link">Home</Link>
              <span className="about-hero__breadcrumb-sep">/</span>
              <Link href="/about" className="about-hero__breadcrumb-link">About</Link>
              <span className="about-hero__breadcrumb-sep">/</span>
              <span className="about-hero__breadcrumb-current">SEC Registration</span>
            </div>
            <h1 className="about-hero__title">SEC <em>Registration</em></h1>
            <div className="about-hero__divider" />
            <p className="about-hero__subtitle">
              PAGE is a duly registered non-stock, non-profit organization under the Securities and Exchange Commission (SEC) of the Philippines.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="container" style={{ marginTop: "40px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "40px",
            alignItems: "start"
          }}>
            
            {/* Left Side: Summary Card */}
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "32px",
              backdropFilter: "blur(20px)",
              color: "#fff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  background: "var(--accent-dim)",
                  padding: "12px",
                  borderRadius: "12px",
                  color: "var(--accent)"
                }}>
                  <Shield size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>Registration Status</h2>
                  <span style={{ color: "#10b981", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <CheckCircle size={14} /> Duly Registered & Active
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Registered Name</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{SEC_DETAILS.companyName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Registration Number</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, fontFamily: "monospace" }}>{SEC_DETAILS.registrationNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Date of Incorporation</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{SEC_DETAILS.dateRegistered}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Corporation Type</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{SEC_DETAILS.type}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Document Preview Block */}
            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "16px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center"
            }}>
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: "340px",
                height: "450px",
                background: "#fdfdfb",
                border: "1px solid #dcdad5",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "#1c1917",
                marginBottom: "32px"
              }}>
                {/* Border Ring */}
                <div style={{
                  position: "absolute",
                  inset: "10px",
                  border: "2px double rgba(0, 0, 0, 0.15)",
                  pointerEvents: "none"
                }} />

                <Award size={48} style={{ color: "#d97706", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 4px", fontWeight: 700 }}>Republic of the Philippines</h3>
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px", color: "#444" }}>Securities and Exchange Commission</h4>
                
                <div style={{ height: "1px", width: "60%", background: "rgba(0, 0, 0, 0.1)", marginBottom: "24px" }} />
                
                <h2 style={{ fontSize: "18px", fontFamily: "serif", fontWeight: 700, margin: "0 0 12px" }}>CERTIFICATE OF INCORPORATION</h2>
                <p style={{ fontSize: "10px", lineHeight: 1.6, color: "#444", margin: "0 0 20px" }}>
                  This is to certify that the Articles of Incorporation and By-Laws of the above named corporation were duly approved by the Commission on this date.
                </p>

                <div style={{ marginTop: "auto", width: "100%" }}>
                  <p style={{ fontSize: "10px", fontWeight: 600, margin: 0 }}>Company Reg. No. {SEC_DETAILS.registrationNumber}</p>
                  <p style={{ fontSize: "9px", color: "#666", margin: "4px 0 0" }}>Signed: {SEC_DETAILS.signatory}</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
      {/* Basic Footer */}
      <footer style={{ background: "#04080e", borderTop: "1px solid rgba(255, 255, 255, 0.05)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px", margin: 0 }}>
          © 2026 Philippine Association for Graduate Education. All rights reserved.
        </p>
      </footer>
    </>
  );
}
