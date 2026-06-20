"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, FileCheck, CheckCircle } from "lucide-react";
import { api } from "../../../lib/api-client";
import "../about-page.css";

// ── Mock BIR Data ─────────────────────────────────────────────────────────
const BIR_DETAILS = {
  registeredName: "PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION PHILIPPINES, (PAGE) INC.",
  tin: "661-807-029-000",
  certificateNumber: "CCN-2024-0901",
  status: "Tax Exempt status active under Section 30(H) of the NIRC",
  dateIssued: "September 1, 2024",
  signatory: "Romeo D. Lumagui Jr. (Commissioner of Internal Revenue)",
};

export default function BirCertificationPage() {
  const [scrolled, setScrolled] = useState(false);
  const [description, setDescription] = useState("Official Tax Identification Number (TIN) registration and Certificate of Tax Exemption issued by the Bureau of Internal Revenue (BIR).");
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);

    const fetchData = async () => {
      try {
        const birRes = await api.get("/public/about-page/sections/bir_certification");
        if (birRes.success && birRes.data) {
          setDescription(birRes.data.content);
        }
        const docRes = await api.get("/public/about-page/documents/bir_certification");
        if (docRes.success && docRes.data) {
          setDocuments(docRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

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
              <span className="about-hero__breadcrumb-current">BIR Certification</span>
            </div>
            <h1 className="about-hero__title">BIR <em>Certification</em></h1>
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
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>BIR Status</h2>
                  <span style={{ color: "#10b981", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <CheckCircle size={14} /> Registered & Tax Exempt
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Registered Name</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{BIR_DETAILS.registeredName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Tax Identification Number (TIN)</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, fontFamily: "monospace" }}>{BIR_DETAILS.tin}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Certificate Number</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, fontFamily: "monospace" }}>{BIR_DETAILS.certificateNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Exemption Category</span>
                  <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 500, color: "var(--accent)" }}>{BIR_DETAILS.status}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Date of Issuance</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{BIR_DETAILS.dateIssued}</p>
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
                background: "#fcfcfa",
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
                  border: "2px double rgba(0, 0, 0, 0.12)",
                  pointerEvents: "none"
                }} />

                <FileCheck size={48} style={{ color: "#0369a1", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 4px", fontWeight: 700 }}>Bureau of Internal Revenue</h3>
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px", color: "#444" }}>Department of Finance</h4>
                
                <div style={{ height: "1px", width: "60%", background: "rgba(0, 0, 0, 0.1)", marginBottom: "24px" }} />
                
                <h2 style={{ fontSize: "16px", fontFamily: "serif", fontWeight: 700, margin: "0 0 12px" }}>CERTIFICATE OF TAX EXEMPTION</h2>
                <p style={{ fontSize: "9px", lineHeight: 1.6, color: "#444", margin: "0 0 20px" }}>
                  This certifies that the above named corporation is exempt from income tax on revenues derived by it in accordance with Section 30(H) of the National Internal Revenue Code.
                </p>

                <div style={{ marginTop: "auto", width: "100%" }}>
                  <p style={{ fontSize: "10px", fontWeight: 600, margin: 0 }}>TIN: {BIR_DETAILS.tin}</p>
                  <p style={{ fontSize: "9px", color: "#666", margin: "4px 0 0" }}>Signed: {BIR_DETAILS.signatory}</p>
                </div>
              </div>

              {documents.length > 0 && (
                <div style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                  <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Uploaded Certificates</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {documents.map((doc: any) => (
                      <a
                        key={doc.id}
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
      <footer style={{ background: "#04080e", borderTop: "1px solid rgba(255, 255, 255, 0.05)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px", margin: 0 }}>
          © 2026 Philippine Association for Graduate Education. All rights reserved.
        </p>
      </footer>
    </>
  );
}
