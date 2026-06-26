"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, FileText, Award, Calendar, CheckCircle } from "lucide-react";
import { api } from "../../../lib/api-client";
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
  const [description, setDescription] = useState("PAGE is a duly registered non-stock, non-profit organization under the Securities and Exchange Commission (SEC) of the Philippines.");
  const [documents, setDocuments] = useState<any[]>([]);
  const [secRecords, setSecRecords] = useState<any[]>([]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isPdf = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return cleanUrl.toLowerCase().endsWith(".pdf");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);

    const fetchData = async () => {
      try {
        const secRes = await api.get("/public/about-page/sections/sec_registration");
        if (secRes.success && secRes.data) {
          setDescription(secRes.data.content);
        }
        const docRes = await api.get("/public/about-page/documents/sec_registration");
        if (docRes.success && docRes.data) {
          setDocuments(docRes.data);
        }
        // Fetch dynamic SEC registrations sorted newest first
        const recordsRes = await api.get("/sec-registrations?limit=10");
        if (recordsRes.success && recordsRes.data) {
          setSecRecords(recordsRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeRecord = secRecords.length > 0 ? secRecords[0] : null;

  const displayDetails = activeRecord ? {
    companyName: activeRecord.registrationName,
    registrationNumber: activeRecord.registrationNumber,
    dateRegistered: formatDate(activeRecord.dateOfIncorporation),
    type: activeRecord.exemptionCategory,
  } : SEC_DETAILS;

  const hasDocuments = documents.length > 0 || secRecords.some(r => r.imageUrl);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <style>{`
        .sec-pdf-btn:hover {
          background: #143e6c !important;
        }
      `}</style>
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
              {description}
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
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{displayDetails.companyName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Registration Number</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, fontFamily: "monospace" }}>{displayDetails.registrationNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Date of Incorporation</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{displayDetails.dateRegistered}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Corporation Type</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{displayDetails.type}</p>
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
                padding: activeRecord && activeRecord.imageUrl ? "16px" : "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#1c1917",
                marginBottom: "32px",
                overflow: "hidden"
              }}>
                {activeRecord && activeRecord.imageUrl ? (
                  isPdf(activeRecord.imageUrl) ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
                      <FileText size={64} style={{ color: "#ef4444" }} />
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 12px", color: "#1c1917", textAlign: "center", lineBreak: "anywhere" }}>
                        {activeRecord.registrationName}
                      </h3>
                      <p style={{ fontSize: "12px", color: "#666", margin: 0, textAlign: "center" }}>
                        Official SEC Certificate (PDF)
                      </p>
                      <a
                        href={activeRecord.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#1e538e",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "14px",
                          fontWeight: 600,
                          transition: "background 0.2s ease",
                          marginTop: "8px"
                        }}
                        className="sec-pdf-btn"
                      >
                        View PDF File
                      </a>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeRecord.imageUrl}
                      alt="SEC Certificate"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {hasDocuments && (
                <div style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                  <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Uploaded Certificates</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Render dynamic DB registrations first */}
                    {secRecords.filter(r => r.imageUrl).map((record) => (
                      <a
                        key={`db-${record.id}`}
                        href={record.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "8px",
                          color: "var(--accent)",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 500
                        }}
                      >
                        <FileText size={16} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {record.registrationName} (No. {record.registrationNumber})
                        </span>
                      </a>
                    ))}

                    {/* Render static documents folder certificates */}
                    {documents.map((doc: any) => (
                      <a
                        key={`doc-${doc.id}`}
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "8px",
                          color: "var(--accent)",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 500
                        }}
                      >
                        <FileText size={16} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {doc.file_name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
