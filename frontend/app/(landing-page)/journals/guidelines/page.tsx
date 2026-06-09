"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, FileText, CheckCircle, HelpCircle, Download, ArrowRight, Layers, FileSignature } from "lucide-react";
import "../journals.css";

export default function SubmissionGuidelinesPage() {
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
        <section className="journals-hero" style={{ padding: "120px 0 60px" }}>
          <div className="journals-container">
            <div className="journals-hero__breadcrumb">
              <Link href="/" className="journals-hero__breadcrumb-link">Home</Link>
              <span className="journals-hero__breadcrumb-sep">/</span>
              <Link href="/journals" className="journals-hero__breadcrumb-link">Journals</Link>
              <span className="journals-hero__breadcrumb-sep">/</span>
              <span className="journals-hero__breadcrumb-current">Submission Guidelines</span>
            </div>
            <h1 className="journals-hero__title">Submission <em>Guidelines</em></h1>
            <div className="journals-hero__divider" />
            <p className="journals-hero__subtitle" style={{ maxWidth: "700px" }}>
              Author instructions, manuscript templates, and ethical publishing standards for the PAGE Refereed Research Journals.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="journals-container" style={{ marginTop: "40px", color: "#fff" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.2fr 1fr",
            gap: "40px",
            alignItems: "start"
          }}>
            
            {/* Left Column: Guidelines details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Box 1: Formatting */}
              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "16px",
                padding: "32px"
              }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", color: "var(--accent)" }}>
                  <Layers size={22} /> Manuscript Formatting Requirements
                </h2>
                <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.7)", marginBottom: "20px" }}>
                  All submissions must be original, unpublished works and must conform to the APA 7th Edition style guide. Manuscripts must follow these specifications:
                </p>
                <ul style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.8, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li><strong>File Format:</strong> Microsoft Word (.doc or .docx) only.</li>
                  <li><strong>Length:</strong> 4,000 to 6,000 words, including references and abstract.</li>
                  <li><strong>Abstract:</strong> A single paragraph of 150 to 250 words, summarising the study's scope, methodology, results, and implications.</li>
                  <li><strong>Keywords:</strong> 3 to 5 relevant terms listed below the abstract.</li>
                  <li><strong>Font:</strong> Times New Roman, 12 pt size, double-spaced.</li>
                  <li><strong>Margins:</strong> 1 inch (2.54 cm) on all sides.</li>
                </ul>
              </div>

              {/* Box 2: Submission Process */}
              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "16px",
                padding: "32px"
              }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", color: "var(--accent)" }}>
                  <FileSignature size={22} /> Submission Process Steps
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      color: "#fff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>1</div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>Account Registration</h3>
                      <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                        Register for a PAGE Member Account. If you are an institutional faculty member, consult your PIO for institutional access codes.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      color: "#fff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>2</div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>Upload Manuscript</h3>
                      <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                        Access your Member Dashboard and upload your blinded manuscript (ensuring author names are completely removed from the file to preserve double-blind peer review integrity).
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      color: "#fff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>3</div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>Initial Review & Plagiarism Check</h3>
                      <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                        The editorial office conducts an initial formatting review and plagiarism scan. Submissions exceeding 15% text match limits will be returned.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Sidebar Downloads */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Download card */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center"
              }}>
                <FileText size={40} style={{ color: "var(--accent)", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>Manuscript Template</h3>
                <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)", margin: "0 0 16px", lineHeight: 1.4 }}>
                  Download the official Word template pre-formatted with PAGE styling, fonts, and headers.
                </p>
                <button
                  onClick={() => alert("Downloading PAGE Manuscript Template...")}
                  style={{
                    width: "100%",
                    background: "#fff",
                    color: "#000",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Download size={14} /> Download template.docx
                </button>
              </div>

              {/* Ethics Box */}
              <div style={{
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "16px",
                padding: "24px"
              }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", margin: "0 0 12px" }}>
                  <CheckCircle size={16} style={{ color: "#10b981" }} /> Ethical Compliance
                </h3>
                <p style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.5)", lineHeight: 1.5, margin: 0 }}>
                  Authors must explicitly declare any funding conflicts and verify that institutional review board (IRB) ethical clearances were obtained for human participant studies.
                </p>
              </div>

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
