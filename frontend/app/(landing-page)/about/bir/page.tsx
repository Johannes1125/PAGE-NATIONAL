"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, FileCheck, CheckCircle } from "lucide-react";
import { api } from "../../../lib/api-client";
import "../about-page.css";

interface BirCertification {
  id: string;
  registrationName: string;
  tinNumber: string;
  certificationNumber: string;
  exemptionCategory: string;
  dateOfIssuance: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BirCertificationPage() {
  const [scrolled, setScrolled] = useState(false);
  const [description, setDescription] = useState("Official Tax Identification Number (TIN) registration and Certificate of Tax Exemption issued by the Bureau of Internal Revenue (BIR).");
  const [documents, setDocuments] = useState<any[]>([]);
  const [birRecords, setBirRecords] = useState<BirCertification[]>([]);

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
        const birRes = await api.get<any>("/public/about-page/sections/bir_certification");
        if (birRes.success && birRes.data) {
          setDescription(birRes.data.content);
        }
        const docRes = await api.get<any>("/public/about-page/documents/bir_certification");
        if (docRes.success && docRes.data) {
          setDocuments(docRes.data);
        }
        const recordsRes = await api.get<any>("/bir-certifications");
        if (recordsRes.success && recordsRes.data) {
          setBirRecords(recordsRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeRecord = birRecords.length > 0 ? birRecords[0] : null;

  const displayDetails = activeRecord ? {
    registeredName: activeRecord.registrationName,
    tin: activeRecord.tinNumber,
    certificateNumber: activeRecord.certificationNumber,
    status: activeRecord.exemptionCategory,
    dateIssued: formatDate(activeRecord.dateOfIssuance),
  } : {
    registeredName: "No BIR certification record found",
    tin: "—",
    certificateNumber: "—",
    status: "—",
    dateIssued: "—",
  };

  const hasDocuments = documents.length > 0 || birRecords.some(r => r.imageUrl);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <style>{`
        .bir-pdf-btn:hover {
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
                  {activeRecord ? (
                    <span style={{ color: "#10b981", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      <CheckCircle size={14} /> Registered & Tax Exempt
                    </span>
                  ) : (
                    <span style={{ color: "#6b7280", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      No Record
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Registered Name</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{displayDetails.registeredName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Tax Identification Number (TIN)</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, fontFamily: "monospace" }}>{displayDetails.tin}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Certificate Number</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500, fontFamily: "monospace" }}>{displayDetails.certificateNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Exemption Category</span>
                  <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 500, color: "var(--accent)" }}>{displayDetails.status}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase" }}>Date of Issuance</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>{displayDetails.dateIssued}</p>
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
                        Official BIR Certificate (PDF)
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
                        className="bir-pdf-btn"
                      >
                        View PDF File
                      </a>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeRecord.imageUrl}
                      alt="BIR Certificate"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )
                ) : (
                  <>
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
                      Please configure the official tax exemption details in the admin dashboard to showcase the certificate.
                    </p>
                  </>
                )}
              </div>

              {hasDocuments && (
                <div style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                  <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Uploaded Certificates</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Render dynamic DB registrations first */}
                    {birRecords.filter(r => r.imageUrl).map((record) => (
                      <a
                        key={`db-${record.id}`}
                        href={record.imageUrl!}
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
                          {record.registrationName} (No. {record.certificationNumber})
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
      <footer style={{ background: "#04080e", borderTop: "1px solid rgba(255, 255, 255, 0.05)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px", margin: 0 }}>
          © 2026 Philippine Association for Graduate Education. All rights reserved.
        </p>
      </footer>
    </>
  );
}
