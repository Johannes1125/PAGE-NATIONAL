"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Eye, FileUp, Image as ImageIcon, Link2, List, ListOrdered, X } from "lucide-react";
import AdminNotifications from "../components/AdminNotifications";
import "./create-new-post.css";

type PublishMode = "now" | "schedule";
type PostRecordStatus = "draft" | "published" | "scheduled";

type PostRecord = {
  id: string;
  title: string;
  category: string;
  author: string;
  excerpt: string;
  contentHtml: string;
  status: PostRecordStatus;
  scheduledAt?: string;
  publishedAt?: string;
};

function nowLabel(): string {
  return new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CreateNewPostPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("article");
  const [author, setAuthor] = useState("Dr. E. Santos");
  const [dateTime, setDateTime] = useState("");
  const [assignedMembers, setAssignedMembers] = useState("none");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [publishMode, setPublishMode] = useState<PublishMode>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [featuredImageFiles, setFeaturedImageFiles] = useState<File[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);

  const [records, setRecords] = useState<PostRecord[]>([]);
  const [notification, setNotification] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");

  const editorRef = useRef<HTMLDivElement | null>(null);

  const statusLabel = records[0]?.status?.toUpperCase() ?? "DRAFT";

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const dueTitles: string[] = [];

      setRecords((current) =>
        current.map((record) => {
          if (record.status !== "scheduled" || !record.scheduledAt) return record;

          if (new Date(record.scheduledAt).getTime() <= now) {
            dueTitles.push(record.title);
            return {
              ...record,
              status: "published",
              publishedAt: nowLabel(),
            };
          }

          return record;
        }),
      );

      if (dueTitles.length > 0) {
        setNotification(`Scheduled publishing completed: ${dueTitles.join(", ")}`);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    setContentHtml(editorRef.current?.innerHTML ?? "");
  };

  const handleOpenPreview = () => {
    if (!title.trim()) {
      setError("Post title is required before preview.");
      return;
    }
    setError("");
    setPreviewOpen(true);
  };

  const createRecord = (status: PostRecordStatus): PostRecord | null => {
    if (!title.trim()) {
      setError("Post title is required.");
      return null;
    }

    if (status === "scheduled" && !scheduledAt) {
      setError("Please set a schedule date and time.");
      return null;
    }

    setError("");

    return {
      id: `post-${Date.now()}`,
      title: title.trim(),
      category,
      author: author.trim() || "Unknown Author",
      excerpt: excerpt.trim(),
      contentHtml,
      status,
      scheduledAt: status === "scheduled" ? scheduledAt : undefined,
      publishedAt: status === "published" ? nowLabel() : undefined,
    };
  };

  const handleSaveDraft = () => {
    const record = createRecord("draft");
    if (!record) return;

    setRecords((current) => [record, ...current]);
    setNotification(`Draft saved: ${record.title}`);
  };

  const handleSubmit = () => {
    const targetStatus: PostRecordStatus = publishMode === "now" ? "published" : "scheduled";
    const record = createRecord(targetStatus);
    if (!record) return;

    setRecords((current) => [record, ...current]);

    if (targetStatus === "published") {
      setNotification(`Post published: ${record.title}`);
    } else {
      setNotification(`Post scheduled for publishing: ${record.title}`);
    }
  };

  const handlePublishNow = () => {
    const record = createRecord("published");
    if (!record) return;

    setRecords((current) => [record, ...current]);
    setNotification(`Post saved as published: ${record.title}`);
  };

  return (
    <main className="cnp-page">
      <aside className="cnp-sidebar">
        <div className="cnp-sidebar__inner">
          <div className="cnp-brand">
            <div className="cnp-brand__badge">P</div>
            <div>
              <div className="cnp-brand__eyebrow">PAGE</div>
              <div className="cnp-brand__title">Admin Dashboard</div>
              <div className="cnp-brand__subtitle">Philippine Association for Graduate Education</div>
            </div>
          </div>
          <AdminNotifications />

          <nav className="cnp-nav">
            <Link href="/" className="cnp-nav__link">Main Page</Link>
            <Link href="/admin-dashboard" className="cnp-nav__link">Overview</Link>
            <Link href="/admin-dashboard/create-new-post" className="cnp-nav__link cnp-nav__link--active">Create New Post</Link>
            <Link href="/admin-dashboard/approve-post" className="cnp-nav__link">Approve Posts</Link>
            <Link href="/admin-dashboard/manage-users" className="cnp-nav__link">Manage Users</Link>
            <Link href="/admin-dashboard/view-messages" className="cnp-nav__link">Messages</Link>
          </nav>
        </div>
      </aside>

      <section className="cnp-main">
        <section className="cnp-hero" aria-hidden="true">
          <div className="cnp-hero__inner" aria-hidden="false">
            <h1 className="cnp-hero__title">Create New Post</h1>
            <p className="cnp-hero__subtitle">Create and publish instantly without approval</p>
          </div>

          <svg className="cnp-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,50 C220,95 420,12 720,55 C980,92 1185,22 1440,58 L1440,120 L0,120 Z" fill="#eef3f9" />
          </svg>
        </section>

        <section className="cnp-content">
          <section className="cnp-layout">
            <article className="cnp-form-card">
              <label className="cnp-field">
                <span>Post Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Create Post Title..."
                />
              </label>

              <div className="cnp-grid-2">
                <label className="cnp-field">
                  <span>Category</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="article">Article</option>
                    <option value="research">Research</option>
                    <option value="journal">Journal</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </label>

                <label className="cnp-field">
                  <span>Author&apos;s Name</span>
                  <input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="Enter author's name..."
                  />
                </label>
              </div>

              <div className="cnp-grid-2">
                <label className="cnp-field">
                  <span>Date & Time</span>
                  <div className="cnp-field__with-icon">
                    <CalendarDays size={14} />
                    <input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
                  </div>
                </label>

                <label className="cnp-field">
                  <span>Assigned Members</span>
                  <select value={assignedMembers} onChange={(event) => setAssignedMembers(event.target.value)}>
                    <option value="none">Assigned other members...</option>
                    <option value="board-a">Editorial Board A</option>
                    <option value="board-b">Editorial Board B</option>
                    <option value="peer-review">Peer Review Team</option>
                  </select>
                </label>
              </div>

              <label className="cnp-field">
                <span>Excerpt</span>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Create your excerpt here..."
                />
                <small>{excerpt.length}/500 characters</small>
              </label>

              <section className="cnp-editor-block">
                <div className="cnp-editor-block__head">
                  <span>Content</span>
                  <div className="cnp-editor-toolbar">
                    <button type="button" onClick={() => applyFormat("bold")}>B</button>
                    <button type="button" onClick={() => applyFormat("italic")}>I</button>
                    <button type="button" onClick={() => applyFormat("underline")}>U</button>
                    <button type="button" onClick={() => applyFormat("insertUnorderedList")}><List size={14} /></button>
                    <button type="button" onClick={() => applyFormat("insertOrderedList")}><ListOrdered size={14} /></button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = window.prompt("Enter URL");
                        if (link) applyFormat("createLink", link);
                      }}
                    >
                      <Link2 size={14} />
                    </button>
                  </div>
                </div>

                <div
                  ref={editorRef}
                  className="cnp-editor"
                  contentEditable
                  onInput={() => setContentHtml(editorRef.current?.innerHTML ?? "")}
                  suppressContentEditableWarning
                  data-placeholder="Create your content here..."
                />
              </section>

              <div className="cnp-grid-2">
                <label className="cnp-upload">
                  <span className="cnp-upload__title">Featured Image</span>
                  <label htmlFor="featured-image-input" className="cnp-upload__box">
                    <ImageIcon size={18} />
                    Click or drag image to upload
                  </label>
                  <input
                    id="featured-image-input"
                    className="cnp-upload__input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => setFeaturedImageFiles(Array.from(event.target.files ?? []))}
                  />
                  {featuredImageFiles.length > 0 && (
                    <small className="cnp-upload__files">{featuredImageFiles.map((file) => file.name).join(", ")}</small>
                  )}
                  {featuredImageFiles.length === 0 && (
                    <small className="cnp-upload__empty">No file chosen</small>
                  )}
                </label>

                <label className="cnp-upload">
                  <span className="cnp-upload__title">Proof of Payment (if applicable)</span>
                  <label htmlFor="proof-files-input" className="cnp-upload__box">
                    <FileUp size={18} />
                    Upload PDF or JPG receipt
                  </label>
                  <input
                    id="proof-files-input"
                    className="cnp-upload__input"
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    onChange={(event) => setProofFiles(Array.from(event.target.files ?? []))}
                  />
                  {proofFiles.length > 0 && <small className="cnp-upload__files">{proofFiles.map((file) => file.name).join(", ")}</small>}
                  {proofFiles.length === 0 && <small className="cnp-upload__empty">No file chosen</small>}
                </label>
              </div>

              <label className="cnp-field cnp-field--supporting">
                <span>Supporting Files</span>
                <span className="cnp-supporting-row">
                  <input
                    id="supporting-files-input"
                    className="cnp-upload__input"
                    type="file"
                    multiple
                    onChange={(event) => setSupportingFiles(Array.from(event.target.files ?? []))}
                  />
                  <label htmlFor="supporting-files-input" className="cnp-supporting-btn">Choose Files</label>
                  <span className="cnp-supporting-text">
                    {supportingFiles.length > 0
                      ? `${supportingFiles.length} file(s) selected`
                      : "No file chosen"}
                  </span>
                </span>
                {supportingFiles.length > 0 && (
                  <small>{supportingFiles.map((file) => file.name).join(", ")}</small>
                )}
              </label>

              <section className="cnp-publish-options">
                <span>Publishing Options</span>
                <label>
                  <input
                    type="radio"
                    checked={publishMode === "now"}
                    onChange={() => setPublishMode("now")}
                  />
                  Publish now
                </label>
                <label>
                  <input
                    type="radio"
                    checked={publishMode === "schedule"}
                    onChange={() => setPublishMode("schedule")}
                  />
                  Schedule
                </label>

                {publishMode === "schedule" && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                  />
                )}
              </section>

              <section className="cnp-actions">
                <button type="button" className="cnp-btn cnp-btn--primary" onClick={handleSubmit}>
                  Submit for Approval
                </button>
                <button type="button" className="cnp-btn cnp-btn--secondary" onClick={handleSaveDraft}>
                  Save as Draft
                </button>
                <button type="button" className="cnp-btn cnp-btn--secondary" onClick={handlePublishNow}>
                  Save as Published
                </button>
                <button type="button" className="cnp-btn cnp-btn--outline" onClick={handleOpenPreview}>
                  <Eye size={14} /> Preview
                </button>
                <button type="button" className="cnp-btn cnp-btn--ghost">
                  Cancel Submission
                </button>
              </section>

              {error && <p className="cnp-error">{error}</p>}
            </article>

            <aside className="cnp-sidecard">
              <section className="cnp-side-block">
                <h3>Submission Info</h3>
                <p><strong>Status:</strong> {statusLabel}</p>
                <p><strong>Submitted By:</strong> {author || "N/A"}</p>
                <p><strong>Panel:</strong> National Board</p>
                <p><strong>Visibility:</strong> {visibility}</p>
              </section>

              <section className="cnp-side-block cnp-side-block--info">
                <h4>Publishing Info</h4>
                <ol>
                  <li>As an admin, your posts are published immediately without approval.</li>
                  <li>Published posts will be visible to all users on the main page.</li>
                  <li>You can edit or delete published posts from user management section.</li>
                </ol>
              </section>

              {notification && <p className="cnp-notice">{notification}</p>}
            </aside>
          </section>
        </section>
      </section>

      {previewOpen && (
        <section className="cnp-preview-backdrop" role="dialog" aria-modal="true" aria-label="Post preview">
          <article className="cnp-preview">
            <div className="cnp-preview__head">
              <h2>Preview Content</h2>
              <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                <X size={16} />
              </button>
            </div>

            <h3>{title || "Untitled Post"}</h3>
            <p className="cnp-preview__meta">{category} • {author || "Unknown Author"}</p>
            <p>{excerpt || "No excerpt yet."}</p>

            <div
              className="cnp-preview__content"
              dangerouslySetInnerHTML={{ __html: contentHtml || "<p>No content yet.</p>" }}
            />
          </article>
        </section>
      )}
    </main>
  );
}
