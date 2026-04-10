"use client";

import Link from "next/link";
import { FileText, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import "./article-submission.css";

type ArticleSubmissionStatus = "pending";

type ArticleSubmissionRecord = {
  id: string;
  title: string;
  author: string;
  abstract: string;
  keywords: string[];
  fileName: string;
  status: ArticleSubmissionStatus;
  submittedAt: string;
};

const STORAGE_KEY = "org-article-submissions";

function nowLabel(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ArticleSubmissionPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [articleFile, setArticleFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [records, setRecords] = useState<ArticleSubmissionRecord[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ArticleSubmissionRecord[];
      if (Array.isArray(parsed)) setRecords(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSubmit = () => {
    if (!title.trim() || !author.trim() || !abstract.trim() || !articleFile) {
      setError("Please complete all required fields and upload a file.");
      return;
    }

    const isValidFile = articleFile.name.toLowerCase().endsWith(".pdf") || articleFile.name.toLowerCase().endsWith(".docx");
    if (!isValidFile) {
      setError("Only PDF or DOCX files are allowed.");
      return;
    }

    const keywords = keywordsInput
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const record: ArticleSubmissionRecord = {
      id: `article-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      abstract: abstract.trim(),
      keywords,
      fileName: articleFile.name,
      status: "pending",
      submittedAt: nowLabel(),
    };

    setRecords((current) => [record, ...current]);
    setNotice(`Article submitted as pending: ${record.title}`);
    setError("");
    setTitle("");
    setAuthor("");
    setAbstract("");
    setKeywordsInput("");
    setArticleFile(null);
  };

  return (
    <main className="oas-page">
      <aside className="oas-sidebar">
        <div className="oas-sidebar__inner">
          <div className="oas-brand">
            <div className="oas-brand__badge">P</div>
            <div>
              <div className="oas-brand__eyebrow">PAGE</div>
              <div className="oas-brand__title">Org Dashboard</div>
              <div className="oas-brand__subtitle">Organization Member Workspace</div>
            </div>
          </div>

          <nav className="oas-nav">
            <Link href="/" className="oas-nav__link">Main Page</Link>
            <Link href="/org-dashboard" className="oas-nav__link">Overview</Link>
            <Link href="/org-dashboard/create-post" className="oas-nav__link">Create Post for Approval</Link>
            <Link href="/org-dashboard/article-submission" className="oas-nav__link oas-nav__link--active">Article Submission</Link>
            <Link href="/org-dashboard/reviewer-assignment" className="oas-nav__link">Reviewer Assignment</Link>
            <Link href="/org-dashboard/certificate-generation" className="oas-nav__link">Certificate Generation</Link>
            <Link href="/org-dashboard/membership-request" className="oas-nav__link">Membership Request</Link>
            <Link href="/org-dashboard/proof-of-payment" className="oas-nav__link">Proof of Payment</Link>
            <Link href="/org-dashboard/messaging" className="oas-nav__link">Messaging Page</Link>
          </nav>
        </div>
      </aside>

      <section className="oas-main">
        <section className="oas-hero">
          <div className="oas-hero__inner">
            <h1 className="oas-hero__title">Article Submission</h1>
            <p className="oas-hero__subtitle">Submit documented articles with complete metadata for review tracking.</p>
          </div>
          <svg className="oas-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,50 C220,95 420,12 720,55 C980,92 1185,22 1440,58 L1440,120 L0,120 Z" fill="#eef3f9" />
          </svg>
        </section>

        <section className="oas-content">
          <section className="oas-layout">
            <article className="oas-card">
              <label className="oas-field">
                <span>Article Title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter article title..." />
              </label>

              <label className="oas-field">
                <span>Author</span>
                <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Enter author name..." />
              </label>

              <label className="oas-field">
                <span>Abstract</span>
                <textarea
                  rows={5}
                  value={abstract}
                  onChange={(event) => setAbstract(event.target.value)}
                  placeholder="Write article abstract..."
                />
              </label>

              <label className="oas-field">
                <span>Keywords</span>
                <input
                  value={keywordsInput}
                  onChange={(event) => setKeywordsInput(event.target.value)}
                  placeholder="e.g. graduate education, peer review, thesis"
                />
                <small>Use commas to separate keywords.</small>
              </label>

              <label className="oas-upload">
                <span>Article File (PDF/DOCX)</span>
                <label htmlFor="article-file-input" className="oas-upload__box">
                  <UploadCloud size={18} />
                  Click to upload PDF or DOCX file
                </label>
                <input
                  id="article-file-input"
                  className="oas-upload__input"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setArticleFile(event.target.files?.[0] ?? null)}
                />
                <small>{articleFile ? articleFile.name : "No file selected"}</small>
              </label>

              <button type="button" className="oas-submit-btn" onClick={handleSubmit}>
                Save as Pending Submission
              </button>

              {error && <p className="oas-error">{error}</p>}
              {notice && <p className="oas-notice">{notice}</p>}
            </article>

            <aside className="oas-side">
              <section className="oas-side-block">
                <h3>Submission Logs</h3>
                <div className="oas-records">
                  {records.map((record) => (
                    <article key={record.id} className="oas-record-item">
                      <p>{record.title}</p>
                      <span>{record.author} • {record.status.toUpperCase()}</span>
                      <span>{record.fileName} • {record.submittedAt}</span>
                    </article>
                  ))}
                  {records.length === 0 && <p className="oas-empty">No article submissions yet.</p>}
                </div>
              </section>

              <section className="oas-side-block oas-side-block--meta">
                <h3>Metadata Preview</h3>
                <p><strong>Title:</strong> {title || "N/A"}</p>
                <p><strong>Author:</strong> {author || "N/A"}</p>
                <p><strong>Keywords:</strong> {keywordsInput || "N/A"}</p>
                <p><strong>File:</strong> {articleFile?.name || "N/A"}</p>
                <p><strong>Status:</strong> Pending (on submit)</p>
              </section>

              <section className="oas-side-block oas-side-block--meta">
                <h3>Stored Fields</h3>
                <p><FileText size={12} /> File + metadata are stored for tracking and review.</p>
              </section>
            </aside>
          </section>
        </section>
      </section>
    </main>
  );
}
