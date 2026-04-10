"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Eye, FileImage, Link2, List, ListOrdered, Send, X } from "lucide-react";
import "./create-post.css";

type OrgPostStatus = "draft" | "pending";

type OrgPostRecord = {
  id: string;
  title: string;
  category: string;
  contentHtml: string;
  imageNames: string[];
  mediaNames: string[];
  status: OrgPostStatus;
  createdAt: string;
};

const STORAGE_KEY = "org-dashboard-post-records";

function timestampLabel(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrgCreatePostPage() {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("article");
  const [contentHtml, setContentHtml] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [records, setRecords] = useState<OrgPostRecord[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as OrgPostRecord[];
      if (Array.isArray(parsed)) setRecords(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    setContentHtml(editorRef.current?.innerHTML ?? "");
  };

  const createRecord = (status: OrgPostStatus): OrgPostRecord | null => {
    if (!title.trim()) {
      setError("Post title is required.");
      return null;
    }

    if (!contentHtml.trim()) {
      setError("Post content is required.");
      return null;
    }

    setError("");

    return {
      id: `org-post-${Date.now()}`,
      title: title.trim(),
      category,
      contentHtml,
      imageNames: imageFiles.map((file) => file.name),
      mediaNames: mediaFiles.map((file) => file.name),
      status,
      createdAt: timestampLabel(),
    };
  };

  const handleSaveDraft = () => {
    const record = createRecord("draft");
    if (!record) return;
    setRecords((current) => [record, ...current]);
    setNotice(`Draft saved. Organization copy stored at ${record.createdAt}.`);
  };

  const handleSubmitForApproval = () => {
    const record = createRecord("pending");
    if (!record) return;
    setRecords((current) => [record, ...current]);
    setNotice(
      `Submission sent for admin approval. Notifications sent to admin and organization queue at ${record.createdAt}.`,
    );
  };

  const pendingCount = records.filter((record) => record.status === "pending").length;

  return (
    <main className="ocp-page">
      <aside className="ocp-sidebar">
        <div className="ocp-sidebar__inner">
          <div className="ocp-brand">
            <div className="ocp-brand__badge">P</div>
            <div>
              <div className="ocp-brand__eyebrow">PAGE</div>
              <div className="ocp-brand__title">Org Dashboard</div>
              <div className="ocp-brand__subtitle">Organization Member Workspace</div>
            </div>
          </div>

          <nav className="ocp-nav">
            <Link href="/" className="ocp-nav__link">Main Page</Link>
            <Link href="/org-dashboard" className="ocp-nav__link">Overview</Link>
            <Link href="/org-dashboard/create-post" className="ocp-nav__link ocp-nav__link--active">Create Post for Approval</Link>
            <Link href="/org-dashboard/article-submission" className="ocp-nav__link">Article Submission</Link>
            <Link href="/org-dashboard/reviewer-assignment" className="ocp-nav__link">Reviewer Assignment</Link>
            <Link href="/org-dashboard/certificate-generation" className="ocp-nav__link">Certificate Generation</Link>
            <Link href="/org-dashboard/membership-request" className="ocp-nav__link">Membership Request</Link>
            <Link href="/org-dashboard/proof-of-payment" className="ocp-nav__link">Proof of Payment</Link>
            <Link href="/org-dashboard/messaging" className="ocp-nav__link">Messaging Page</Link>
          </nav>
        </div>
      </aside>

      <section className="ocp-main">
        <section className="ocp-hero">
          <div className="ocp-hero__inner">
            <h1 className="ocp-hero__title">Create Post for Approval</h1>
            <p className="ocp-hero__subtitle">
              Create organization content and submit it for admin review with approval tracking.
            </p>
          </div>
          <svg className="ocp-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,50 C220,95 420,12 720,55 C980,92 1185,22 1440,58 L1440,120 L0,120 Z" fill="#eef3f9" />
          </svg>
        </section>

        <section className="ocp-content">
          <section className="ocp-layout">
            <article className="ocp-card">
              <label className="ocp-field">
                <span>Post Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter title..."
                />
              </label>

              <label className="ocp-field">
                <span>Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="article">Article</option>
                  <option value="research">Research</option>
                  <option value="journal">Journal</option>
                  <option value="announcement">Announcement</option>
                </select>
              </label>

              <section className="ocp-editor-block">
                <div className="ocp-editor-head">
                  <span>Content</span>
                  <div className="ocp-toolbar">
                    <button type="button" onClick={() => applyFormat("bold")}>B</button>
                    <button type="button" onClick={() => applyFormat("italic")}>I</button>
                    <button type="button" onClick={() => applyFormat("underline")}>U</button>
                    <button type="button" onClick={() => applyFormat("insertUnorderedList")}><List size={13} /></button>
                    <button type="button" onClick={() => applyFormat("insertOrderedList")}><ListOrdered size={13} /></button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = window.prompt("Enter URL");
                        if (link) applyFormat("createLink", link);
                      }}
                    >
                      <Link2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  ref={editorRef}
                  className="ocp-editor"
                  contentEditable
                  onInput={() => setContentHtml(editorRef.current?.innerHTML ?? "")}
                  suppressContentEditableWarning
                  data-placeholder="Write content here..."
                />
              </section>

              <section className="ocp-upload-grid">
                <label className="ocp-upload">
                  <span>Images</span>
                  <label htmlFor="ocp-image-input" className="ocp-upload__box">
                    <FileImage size={18} />
                    Click or drag images to upload
                  </label>
                  <input
                    id="ocp-image-input"
                    className="ocp-upload__input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
                  />
                  <small>{imageFiles.length > 0 ? imageFiles.map((file) => file.name).join(", ") : "No image selected"}</small>
                </label>

                <label className="ocp-upload">
                  <span>Media Files</span>
                  <label htmlFor="ocp-media-input" className="ocp-upload__box">
                    <FileImage size={18} />
                    Upload documents, presentations, or media
                  </label>
                  <input
                    id="ocp-media-input"
                    className="ocp-upload__input"
                    type="file"
                    multiple
                    onChange={(event) => setMediaFiles(Array.from(event.target.files ?? []))}
                  />
                  <small>{mediaFiles.length > 0 ? mediaFiles.map((file) => file.name).join(", ") : "No media selected"}</small>
                </label>
              </section>

              <section className="ocp-actions">
                <button type="button" className="ocp-btn ocp-btn--primary" onClick={handleSubmitForApproval}>
                  <Send size={13} /> Submit for Approval
                </button>
                <button type="button" className="ocp-btn ocp-btn--secondary" onClick={handleSaveDraft}>
                  Save as Draft
                </button>
                <button type="button" className="ocp-btn ocp-btn--outline" onClick={() => setPreviewOpen(true)}>
                  <Eye size={13} /> Preview
                </button>
              </section>

              {error && <p className="ocp-error">{error}</p>}
            </article>

            <aside className="ocp-side">
              <section className="ocp-side-block">
                <h3>Submission Status</h3>
                <p><strong>Pending Approval:</strong> {pendingCount}</p>
                <p><strong>Drafts Saved:</strong> {records.filter((record) => record.status === "draft").length}</p>
              </section>

              <section className="ocp-side-block">
                <h3>Recent Submissions</h3>
                <div className="ocp-records">
                  {records.slice(0, 4).map((record) => (
                    <article key={record.id} className="ocp-record-item">
                      <p>{record.title}</p>
                      <span>{record.status.toUpperCase()} • {record.createdAt}</span>
                    </article>
                  ))}
                  {records.length === 0 && <p className="ocp-empty">No submissions yet.</p>}
                </div>
              </section>

              {notice && <p className="ocp-notice">{notice}</p>}
            </aside>
          </section>
        </section>
      </section>

      {previewOpen && (
        <section className="ocp-preview-backdrop" role="dialog" aria-modal="true" aria-label="Post preview">
          <article className="ocp-preview">
            <div className="ocp-preview__head">
              <h2>Preview Content</h2>
              <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                <X size={16} />
              </button>
            </div>
            <h3>{title || "Untitled Post"}</h3>
            <p className="ocp-preview__meta">{category}</p>
            <div
              className="ocp-preview__content"
              dangerouslySetInnerHTML={{ __html: contentHtml || "<p>No content yet.</p>" }}
            />
            {(imageFiles.length > 0 || mediaFiles.length > 0) && (
              <p className="ocp-preview__files">
                <FileImage size={13} /> {[...imageFiles.map((file) => file.name), ...mediaFiles.map((file) => file.name)].join(", ")}
              </p>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
