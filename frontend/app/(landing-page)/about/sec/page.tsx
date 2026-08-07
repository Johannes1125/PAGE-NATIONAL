"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, FileText, Award, CheckCircle } from "lucide-react";
import { api } from "../../../lib/api-client";
import "../about-page.css";

interface SecRecord {
  id: string;
  registrationName: string;
  registrationNumber: string;
  exemptionCategory: string;
  dateOfIncorporation: string;
  imageUrl: string | null;
}

export default function SecRegistrationPage() {
  const [description, setDescription] = useState(
    "PAGE is a duly registered non-stock, non-profit organization under the Securities and Exchange Commission (SEC) of the Philippines."
  );
  const [documents, setDocuments] = useState<any[]>([]);
  const [secRecords, setSecRecords] = useState<SecRecord[]>([]);

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
    const fetchData = async () => {
      try {
        const secRes = await api.get<any>("/public/about-page/sections/sec_registration");
        if (secRes.success && secRes.data) {
          setDescription(secRes.data.content);
        }
        const docRes = await api.get<any>("/public/about-page/documents/sec_registration");
        if (docRes.success && docRes.data) {
          setDocuments(docRes.data);
        }
        const recordsRes = await api.get<any>("/sec-registrations?limit=10");
        if (recordsRes.success && recordsRes.data) {
          setSecRecords(recordsRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const activeRecord = secRecords.length > 0 ? secRecords[0] : null;

  const displayDetails = activeRecord ? {
    companyName: activeRecord.registrationName,
    registrationNumber: activeRecord.registrationNumber,
    dateRegistered: formatDate(activeRecord.dateOfIncorporation),
    type: activeRecord.exemptionCategory,
  } : {
    companyName: "Philippine Association for Graduate Education, Inc.",
    registrationNumber: "SEC Reg. Active",
    dateRegistered: "Est. 1962",
    type: "Non-Stock, Non-Profit Educational Association",
  };

  const hasDocuments = documents.length > 0 || secRecords.some(r => r.imageUrl);

  return (
    <div className="sec-main" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Hero Section */}
      <section className="cbl-hero" style={{ background: "linear-gradient(135deg, #051026 0%, #081734 60%, #112347 100%)", padding: "130px 0 70px", color: "#ffffff", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="container">
          <div className="cbl-breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
            <Link href="/" style={{ color: "rgba(255, 255, 255, 0.75)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>Home</Link>
            <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "13px" }}>/</span>
            <Link href="/about" style={{ color: "rgba(255, 255, 255, 0.75)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>About</Link>
            <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "13px" }}>/</span>
            <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600 }}>SEC Registration</span>
          </div>

          <div style={{ maxWidth: "720px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#ffffff", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", padding: "6px 16px", borderRadius: "20px", marginBottom: "20px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d4a053" }} />
              <span>CORPORATE ACCREDITATION • SEC</span>
            </div>
            <h1 style={{ fontSize: "clamp(38px, 4.5vw, 54px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.8px", marginBottom: "18px" }}>SEC Registration</h1>
            <div style={{ width: "50px", height: "3px", background: "#d4a053", borderRadius: "2px", marginBottom: "22px" }} />
            <p style={{ fontSize: "17px", lineHeight: 1.75, color: "rgba(255, 255, 255, 0.85)", margin: 0 }}>
              {description}
            </p>
          </div>
        </div>
      </section>      {/* Content Section */}
      <section style={{ background: "#f8fafc", padding: "clamp(40px, 6vw, 80px) 0 clamp(60px, 8vw, 100px)" }}>
        <div className="container">
          <div className="sec-content-grid">
            
            {/* Left Side: Registration Details Card */}
            <div className="sec-card sec-card--details">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ background: "#081734", width: "52px", height: "52px", borderRadius: "14px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 16px rgba(8, 23, 52, 0.15)" }}>
                  <Shield size={26} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#081734", margin: 0 }}>Legal Registration Status</h2>
                  <span style={{ color: "#059669", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <CheckCircle size={15} /> Duly Accredited & Active
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "1px" }}>Registered Name</span>
                  <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 700, color: "#081734" }}>{displayDetails.companyName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "1px" }}>Registration Number</span>
                  <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 700, color: "#081734", fontFamily: "monospace" }}>{displayDetails.registrationNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "1px" }}>Date of Incorporation</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 600, color: "#4a5568" }}>{displayDetails.dateRegistered}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "1px" }}>Corporation Classification</span>
                  <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 600, color: "#4a5568" }}>{displayDetails.type}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Certificate Preview Card */}
            <div className="sec-card sec-card--preview">
              <div className="sec-cert-box" style={{
                padding: activeRecord && activeRecord.imageUrl ? "16px" : "32px",
              }}>
                {activeRecord && activeRecord.imageUrl ? (
                  isPdf(activeRecord.imageUrl) ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
                      <FileText size={60} style={{ color: "#ef4444" }} />
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 12px", color: "#081734", textAlign: "center", lineBreak: "anywhere" }}>
                        {activeRecord.registrationName}
                      </h3>
                      <p style={{ fontSize: "13px", color: "#4a5568", margin: 0, textAlign: "center" }}>
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
                          background: "#081734",
                          color: "#ffffff",
                          padding: "10px 22px",
                          borderRadius: "30px",
                          textDecoration: "none",
                          fontSize: "14px",
                          fontWeight: 700,
                          transition: "all 0.2s ease",
                          marginTop: "8px"
                        }}
                      >
                        View Official PDF Document
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
                    <Award size={48} style={{ color: "#d4a053", marginBottom: "16px" }} />
                    <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 4px", fontWeight: 700, color: "#081734" }}>Republic of the Philippines</h3>
                    <h4 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px", color: "#4a5568" }}>Securities and Exchange Commission</h4>
                    
                    <div style={{ height: "1px", width: "60%", background: "#e2e8f0", marginBottom: "20px" }} />
                    
                    <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#081734", margin: "0 0 10px" }}>CERTIFICATE OF INCORPORATION</h2>
                    <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#4a5568", margin: "0 0 20px" }}>
                      This certifies that the Philippine Association for Graduate Education, Inc. is duly incorporated under Philippine corporate regulations.
                    </p>

                    <div style={{ marginTop: "auto", width: "100%" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#081734", margin: 0 }}>SEC Registered Corporation</p>
                    </div>
                  </>
                )}
              </div>

              {hasDocuments && (
                <div style={{ width: "100%", textAlign: "left", marginTop: "8px" }}>
                  <h4 style={{ color: "#081734", fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>Uploaded Certificates</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {secRecords.filter(r => r.imageUrl).map((record) => (
                      <a
                        key={`db-${record.id}`}
                        href={record.imageUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "12px 16px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          color: "#081734",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 600,
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FileText size={18} style={{ color: "#081734" }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {record.registrationName || "SEC Certificate Document"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
