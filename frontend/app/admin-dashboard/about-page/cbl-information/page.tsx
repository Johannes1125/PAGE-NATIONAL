"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Eye, Plus, Trash, Edit } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../about-page.css";
import "../../admin-dashboard.css";

type Signatory = {
  name: string;
  title: string;
  signed: boolean;
  signatureType: "SGD." | "Sgd";
};

type CBLArticle = {
  id: string;
  articleNumber: string;
  title: string;
  sections: string[];
};

type CBLData = {
  title: string;
  subtitle: string;
  introduction: string;
  pdfUrl: string;
  articles: CBLArticle[];
  resolution: string;
  adoptionDate: string;
  secretary: Signatory;
  attestedBy: Signatory[];
};

type Section = {
  id: string;
  section_key: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  updated_at: string;
};

export default function CblInformationManagement() {
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Forms states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [resolution, setResolution] = useState("");
  const [adoptionDate, setAdoptionDate] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [articles, setArticles] = useState<CBLArticle[]>([]);
  const [secretary, setSecretary] = useState<Signatory>({ name: "", title: "", signed: true, signatureType: "SGD." });
  const [attestedBy, setAttestedBy] = useState<Signatory[]>([]);

  // Form for adding a new article
  const [newArtNum, setNewArtNum] = useState("");
  const [newArtTitle, setNewArtTitle] = useState("");
  const [newArtSections, setNewArtSections] = useState("");

  // Form for adding attested signatory
  const [newSigName, setNewSigName] = useState("");
  const [newSigTitle, setNewSigTitle] = useState("");

  useEffect(() => {
    const fetchCBL = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/about-page/sections/cbl_information");
        if (res.success) {
          const s = res.data as Section;
          setSection(s);
          setTitle(s.title);
          
          const parsed = JSON.parse(s.content) as CBLData;
          setSubtitle(parsed.subtitle || "");
          setIntroduction(parsed.introduction || "");
          setResolution(parsed.resolution || "");
          setAdoptionDate(parsed.adoptionDate || "");
          setPdfUrl(parsed.pdfUrl || "");
          setArticles(parsed.articles || []);
          setSecretary(parsed.secretary || { name: "", title: "", signed: true, signatureType: "SGD." });
          setAttestedBy(parsed.attestedBy || []);
        }
      } catch (err) {
        console.error(err);
        gooeyToast.error("Failed to load CBL data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCBL();
  }, []);

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    const contentData: CBLData = {
      title,
      subtitle,
      introduction,
      pdfUrl,
      articles,
      resolution,
      adoptionDate,
      secretary,
      attestedBy,
    };

    try {
      const res = await api.put("/about-page/sections/cbl_information", {
        title,
        content: JSON.stringify(contentData),
        status,
      });

      if (res.success) {
        setSection(res.data);
        gooeyToast.success("CBL Information updated successfully!");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save CBL Information.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddArticle = () => {
    if (!newArtNum || !newArtTitle || !newArtSections) {
      gooeyToast.error("Please fill in Article number, title, and sections.");
      return;
    }
    const newArticle: CBLArticle = {
      id: `art-${Date.now()}`,
      articleNumber: newArtNum,
      title: newArtTitle,
      sections: newArtSections.split("\n").filter((s) => s.trim() !== ""),
    };
    setArticles([...articles, newArticle]);
    setNewArtNum("");
    setNewArtTitle("");
    setNewArtSections("");
    gooeyToast.success("Article added to list. Remember to Save Changes!");
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  const handleAddSignatory = () => {
    if (!newSigName || !newSigTitle) {
      gooeyToast.error("Please fill in name and title.");
      return;
    }
    const newSig: Signatory = {
      name: newSigName,
      title: newSigTitle,
      signed: true,
      signatureType: "SGD.",
    };
    setAttestedBy([...attestedBy, newSig]);
    setNewSigName("");
    setNewSigTitle("");
    gooeyToast.success("Signatory added. Remember to Save Changes!");
  };

  const handleDeleteSignatory = (index: number) => {
    setAttestedBy(attestedBy.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="Constitution & By-Laws"
        subtitle="Loading CBL configurations..."
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="CBL INFORMATION MANAGEMENT"
      subtitle="Manage the Constitution and By-Laws articles, resolutions, and attesting officers."
      eyebrow="Section Editor"
    >
      <div className="admin-shell">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <button
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="about-btn about-btn--secondary"
              disabled={isSaving}
              onClick={() => handleSave("draft")}
            >
              <Save size={16} /> Save as Draft
            </button>
            <button
              type="button"
              className="about-btn about-btn--primary"
              disabled={isSaving}
              onClick={() => handleSave("published")}
            >
              <Globe size={16} /> Publish Changes
            </button>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
          {/* Main Content Fields */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              General Metadata & Intro
            </h3>

            <div className="about-form-group">
              <label className="about-form-label">Title</label>
              <input
                type="text"
                className="about-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Subtitle</label>
              <input
                type="text"
                className="about-input"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Introduction Narrative</label>
              <textarea
                rows={4}
                className="about-textarea"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">PDF Link URL</label>
              <input
                type="text"
                className="about-input"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
              />
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--r-border)", margin: "24px 0" }} />

            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              Articles Registry
            </h3>

            {/* List of current articles */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {articles.map((art) => (
                <div
                  key={art.id}
                  style={{
                    background: "var(--r-surface-2)",
                    border: "1px solid var(--r-border)",
                    borderRadius: "10px",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 600, color: "var(--p-navy)" }}>
                      {art.articleNumber}: {art.title}
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "var(--r-text-muted)", marginTop: "4px" }}>
                      {art.sections.length} Section(s) listed
                    </p>
                  </div>
                  <button
                    type="button"
                    className="about-btn about-btn--danger"
                    style={{ height: "30px", padding: "0 10px" }}
                    onClick={() => handleDeleteArticle(art.id)}
                  >
                    <Trash size={14} /> Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Form to add an article */}
            <div
              style={{
                background: "rgba(20,49,82,0.02)",
                border: "1px dashed var(--r-border-mid)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--p-navy)", marginBottom: "12px" }}>
                Add New Article
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}>
                <input
                  type="text"
                  placeholder="e.g. Article I"
                  className="about-input"
                  value={newArtNum}
                  onChange={(e) => setNewArtNum(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Article Title"
                  className="about-input"
                  value={newArtTitle}
                  onChange={(e) => setNewArtTitle(e.target.value)}
                />
              </div>
              <textarea
                placeholder="Paste sections here (one section per line)..."
                rows={3}
                className="about-textarea"
                value={newArtSections}
                onChange={(e) => setNewArtSections(e.target.value)}
              />
              <button
                type="button"
                className="about-btn about-btn--primary"
                style={{ marginTop: "12px" }}
                onClick={handleAddArticle}
              >
                <Plus size={14} /> Add Article
              </button>
            </div>
          </div>

          {/* Resolutions & Attestation Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="about-editor-card">
              <h3 style={{ fontSize: "15px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
                Resolution & Attestation
              </h3>

              <div className="about-form-group">
                <label className="about-form-label">Adoption Resolution Quote</label>
                <textarea
                  rows={3}
                  className="about-textarea"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Adoption Date Tagline</label>
                <input
                  type="text"
                  className="about-input"
                  placeholder="Adopted, this 3rd day..."
                  value={adoptionDate}
                  onChange={(e) => setAdoptionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="about-editor-card">
              <h3 style={{ fontSize: "15px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
                Bylaws Signatories
              </h3>

              <div className="about-form-group">
                <label className="about-form-label">Corporate Secretary Name</label>
                <input
                  type="text"
                  className="about-input"
                  value={secretary.name}
                  onChange={(e) => setSecretary({ ...secretary, name: e.target.value })}
                />
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Corporate Secretary Title</label>
                <input
                  type="text"
                  className="about-input"
                  value={secretary.title}
                  onChange={(e) => setSecretary({ ...secretary, title: e.target.value })}
                />
              </div>

              <hr style={{ border: 0, borderTop: "1px solid var(--r-border)", margin: "16px 0" }} />

              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-navy)", marginBottom: "10px" }}>
                Attesting Officers List
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {attestedBy.map((sig, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "var(--r-surface-2)",
                      border: "1px solid var(--r-border)",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "12.5px" }}>{sig.name}</span>
                      <p style={{ fontSize: "11px", color: "var(--r-text-muted)" }}>{sig.title}</p>
                    </div>
                    <button
                      type="button"
                      className="about-btn about-btn--danger"
                      style={{ height: "26px", padding: "0 8px" }}
                      onClick={() => handleDeleteSignatory(i)}
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form to add attesting officer */}
              <div
                style={{
                  background: "rgba(20,49,82,0.02)",
                  border: "1px dashed var(--r-border-mid)",
                  borderRadius: "10px",
                  padding: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Officer Name"
                  className="about-input"
                  style={{ marginBottom: "8px", height: "36px" }}
                  value={newSigName}
                  onChange={(e) => setNewSigName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Title (e.g. VP for Luzon)"
                  className="about-input"
                  style={{ marginBottom: "8px", height: "36px" }}
                  value={newSigTitle}
                  onChange={(e) => setNewSigTitle(e.target.value)}
                />
                <button
                  type="button"
                  className="about-btn about-btn--primary"
                  style={{ height: "32px", width: "100%" }}
                  onClick={handleAddSignatory}
                >
                  <Plus size={12} /> Add Signatory
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminSidebarLayout>
  );
}

// Simple loader helper
function Loader2(props: { className?: string; size?: number; color?: string }) {
  return (
    <svg
      className={props.className}
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
