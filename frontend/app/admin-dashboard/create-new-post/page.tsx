"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Eye, FileUp, Image as ImageIcon, Link2, List, ListOrdered, X } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import "./create-new-post.css";
import "../admin-dashboard.css";

type WizardStepId = 1 | 2 | 3;

const creationSteps = [
  {
    id: 1 as WizardStepId,
    label: "Basics",
    description: "Set the identity, audience, and publishing context.",
  },
  {
    id: 2 as WizardStepId,
    label: "Content",
    description: "Write the post, add media, and attach supporting files.",
  },
  {
    id: 3 as WizardStepId,
    label: "Review",
    description: "Confirm the publishing mode and finalize the submission.",
  },
] as const;

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
  const [activeStep, setActiveStep] = useState<WizardStepId>(1);
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
  const activeStepConfig = creationSteps.find((step) => step.id === activeStep) ?? creationSteps[0];

  const goToStep = (step: WizardStepId) => {
    setActiveStep(step);
  };

  const goNext = () => {
    setActiveStep((current) => (current < 3 ? (current + 1) as WizardStepId : current));
  };

  const goBack = () => {
    setActiveStep((current) => (current > 1 ? (current - 1) as WizardStepId : current));
  };

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
    <>
    <AdminSidebarLayout
      pageClassName="cnp-page"
      mainClassName="cnp-main"
      title="Create New Post"
      subtitle="Build the post in focused steps, then review and publish with less friction."
    >
      <section className="cnp-content">
        <section className="cnp-page-intro" aria-labelledby="cnp-page-title">
          <div className="cnp-page-intro__copy">
            <p className="cnp-page-intro__eyebrow">Structured post workflow</p>
            <p id="cnp-page-title" className="cnp-page-intro__subtitle">
              {activeStepConfig.description}
            </p>
          </div>

          <div className="cnp-page-intro__badges" aria-label="Workflow highlights">
            <span className="cnp-page-intro__badge">Step {activeStep} of 3</span>
            <span className="cnp-page-intro__badge">Admin review ready</span>
          </div>
        </section>

        <nav className="cnp-stepper" aria-label="Post creation steps">
          {creationSteps.map((step) => {
            const isActive = step.id === activeStep;

            return (
              <button
                key={step.id}
                type="button"
                className={`cnp-stepper__item${isActive ? " cnp-stepper__item--active" : ""}`}
                onClick={() => goToStep(step.id)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="cnp-stepper__index" aria-hidden="true">
                  {step.id}
                </span>
                <span className="cnp-stepper__copy">
                  <span className="cnp-stepper__label">{step.label}</span>
                  <span className="cnp-stepper__description">{step.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

          <section className="cnp-layout">
            <article className="cnp-form-card">
              {activeStep === 1 && (
                <section className="cnp-step-section" aria-label="Post basics">
                  <div className="cnp-step-section__head">
                    <h3>Post basics</h3>
                    <p>Capture the core details first so the rest of the form has a clear direction.</p>
                  </div>

                  <label className="cnp-field">
                    <span>Post Title</span>
                    <input
                      value={title}
                      onChange={(event) => {
                        const v = event.target.value;
                        const transformed = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
                        setTitle(transformed);
                      }}
                      onBlur={() => {
                        if (title && title.length > 0) {
                          const transformed = title.charAt(0).toUpperCase() + title.slice(1);
                          setTitle(transformed);
                        }
                      }}
                      placeholder="Create post title"
                      aria-describedby="post-title-help"
                      autoCapitalize="words"
                    />
                    <small id="post-title-help">Use a clear title that will scan well in moderation and search results.</small>
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
                        onChange={(event) => {
                          const v = event.target.value;
                          const transformed = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
                          setAuthor(transformed);
                        }}
                        onBlur={() => {
                          if (author && author.length > 0) {
                            const transformed = author.charAt(0).toUpperCase() + author.slice(1);
                            setAuthor(transformed);
                          }
                        }}
                        placeholder="Enter author name"
                        autoCapitalize="words"
                      />
                    </label>
                  </div>

                  <div className="cnp-grid-2">
                    <label className="cnp-field">
                      <span>Date &amp; Time</span>
                      <div className="cnp-field__with-icon">
                        <CalendarDays size={14} />
                        <input
                          type="datetime-local"
                          value={dateTime}
                          onChange={(event) => setDateTime(event.target.value)}
                          aria-label="Post date and time"
                        />
                      </div>
                    </label>

                    <label className="cnp-field">
                      <span>Assigned Members</span>
                      <select value={assignedMembers} onChange={(event) => setAssignedMembers(event.target.value)}>
                        <option value="none">No assignment yet</option>
                        <option value="board-a">Editorial Board A</option>
                        <option value="board-b">Editorial Board B</option>
                        <option value="peer-review">Peer Review Team</option>
                      </select>
                    </label>
                  </div>

                  <label className="cnp-field">
                    <span>Visibility</span>
                    <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                      <option value="public">Public</option>
                      <option value="members">Members only</option>
                      <option value="review">Review queue</option>
                    </select>
                  </label>
                </section>
              )}

              {activeStep === 2 && (
                <section className="cnp-step-section" aria-label="Post content and assets">
                  <div className="cnp-step-section__head">
                    <h3>Post content and assets</h3>
                    <p>Write the body copy and attach supporting files before the final review step.</p>
                  </div>

                  <label className="cnp-field">
                    <span>Excerpt</span>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={excerpt}
                      onChange={(event) => setExcerpt(event.target.value)}
                      placeholder="Write a short summary for readers"
                      aria-describedby="excerpt-help"
                    />
                    <small id="excerpt-help">{excerpt.length}/500 characters. Keep this concise and readable.</small>
                  </label>

                  <section className="cnp-editor-block">
                    <div className="cnp-editor-block__head">
                      <span>Content</span>
                      <div className="cnp-editor-toolbar" aria-label="Rich text controls">
                        <button type="button" onClick={() => applyFormat("bold")} aria-label="Bold">
                          B
                        </button>
                        <button type="button" onClick={() => applyFormat("italic")} aria-label="Italic">
                          I
                        </button>
                        <button type="button" onClick={() => applyFormat("underline")} aria-label="Underline">
                          U
                        </button>
                        <button type="button" onClick={() => applyFormat("insertUnorderedList")} aria-label="Bulleted list">
                          <List size={14} />
                        </button>
                        <button type="button" onClick={() => applyFormat("insertOrderedList")} aria-label="Numbered list">
                          <ListOrdered size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const link = window.prompt("Enter URL");
                            if (link) applyFormat("createLink", link);
                          }}
                          aria-label="Insert link"
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
                      aria-label="Post content editor"
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
                      {featuredImageFiles.length === 0 && <small className="cnp-upload__empty">No file chosen</small>}
                    </label>

                    <label className="cnp-upload">
                      <span className="cnp-upload__title">Proof of Payment</span>
                      <label htmlFor="proof-files-input" className="cnp-upload__box">
                        <FileUp size={18} />
                        Upload PDF or image receipt
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
                      <label htmlFor="supporting-files-input" className="cnp-supporting-btn">
                        Choose Files
                      </label>
                      <span className="cnp-supporting-text">
                        {supportingFiles.length > 0 ? `${supportingFiles.length} file(s) selected` : "No file chosen"}
                      </span>
                    </span>
                    {supportingFiles.length > 0 && <small>{supportingFiles.map((file) => file.name).join(", ")}</small>}
                  </label>
                </section>
              )}

              {activeStep === 3 && (
                <section className="cnp-step-section" aria-label="Review and publish">
                  <div className="cnp-step-section__head">
                    <h3>Review and publish</h3>
                    <p>Check the publishing mode and confirm the final action for this post.</p>
                  </div>

                  <section className="cnp-publish-options">
                    <span>Publishing Options</span>
                    <label>
                      <input type="radio" checked={publishMode === "now"} onChange={() => setPublishMode("now")} />
                      Publish now
                    </label>
                    <label>
                      <input type="radio" checked={publishMode === "schedule"} onChange={() => setPublishMode("schedule")} />
                      Schedule for later
                    </label>

                    {publishMode === "schedule" && (
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(event) => setScheduledAt(event.target.value)}
                        aria-label="Scheduled publish date and time"
                      />
                    )}
                  </section>

                  <section className="cnp-review-grid" aria-label="Submission summary">
                    <article>
                      <span>Title</span>
                      <strong>{title || "Untitled post"}</strong>
                    </article>
                    <article>
                      <span>Category</span>
                      <strong>{category}</strong>
                    </article>
                    <article>
                      <span>Visibility</span>
                      <strong>{visibility}</strong>
                    </article>
                    <article>
                      <span>Assigned</span>
                      <strong>{assignedMembers === "none" ? "Unassigned" : assignedMembers}</strong>
                    </article>
                  </section>
                </section>
              )}

              <div className="cnp-step-actions">
                <div className="cnp-step-actions__group">
                  <button type="button" className="cnp-btn cnp-btn--secondary" onClick={goBack} disabled={activeStep === 1}>
                    Back
                  </button>
                  {activeStep < 3 && (
                    <button type="button" className="cnp-btn cnp-btn--primary" onClick={goNext}>
                      Continue
                    </button>
                  )}
                </div>

                <div className="cnp-step-actions__group">
                  <button type="button" className="cnp-btn cnp-btn--secondary" onClick={handleSaveDraft}>
                    Save Draft
                  </button>
                  {activeStep === 3 && (
                    <button type="button" className="cnp-btn cnp-btn--primary" onClick={handleSubmit}>
                      {publishMode === "schedule" ? "Schedule Post" : "Publish Now"}
                    </button>
                  )}
                  <button type="button" className="cnp-btn cnp-btn--outline" onClick={handleOpenPreview}>
                    <Eye size={14} /> Preview
                  </button>
                </div>
              </div>

              {error && <p className="cnp-error" role="alert">{error}</p>}
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

              {notification && <p className="cnp-notice" aria-live="polite">{notification}</p>}

              <div className="cnp-help-box" role="note" aria-label="Author guidelines">
                <p>Need help with post formatting? <a href="/author-guidelines">Read</a></p>
                <a className="cnp-help-link" href="/author-guidelines">Author Guidelines</a>
              </div>
            </aside>
          </section>
      </section>
    </AdminSidebarLayout>

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
    </>
  );
}
