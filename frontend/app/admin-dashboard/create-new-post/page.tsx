"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Eye, FileUp, Image as ImageIcon, Link2, List, ListOrdered, X, Check } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { gooeyToast } from "goey-toast"; 
import "goey-toast/styles.css";
import "./create-new-post.css";
import "../admin-dashboard.css";

type WizardStepId = 1 | 2 | 3;

const creationSteps = [
  {
    id: 1 as WizardStepId,
    label: "Basics",
    description: "Identity and context.",
  },
  {
    id: 2 as WizardStepId,
    label: "Content",
    description: "Write and attach.",
  },
  {
    id: 3 as WizardStepId,
    label: "Review",
    description: "Confirm and publish.",
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const editorRef = useRef<HTMLDivElement | null>(null);

  const statusLabel = records[0]?.status?.toUpperCase() ?? "DRAFT";
  const activeStepConfig = creationSteps.find((step) => step.id === activeStep) ?? creationSteps[0];

  // ==========================================
  // STRICT VALIDATION LOGIC
  // ==========================================
  const validateStep = (step: WizardStepId): string | null => {
    if (step === 1) {
      if (!title.trim()) return "Please enter a Post Title.";
      if (!category.trim()) return "Please select a Category.";
      if (!author.trim()) return "Please enter an Author's Name.";
      if (!dateTime.trim()) return "Please set a Date & Time.";
      if (assignedMembers === "none") return "Please assign members to this post.";
      if (!visibility.trim()) return "Please select a Visibility setting.";
    }
    if (step === 2) {
      if (!excerpt.trim()) return "An excerpt is required for the preview card.";
      
      const strippedContent = contentHtml.replace(/<[^>]*>?/gm, '').trim();
      if (!strippedContent) return "The body content cannot be empty.";

      if (featuredImageFiles.length === 0) return "Please upload a Featured Image.";
      
      if (category === "events" && proofFiles.length === 0) {
        return "Please upload Proof of Payment for this event.";
      }
    }
    return null;
  };

  const goNext = () => {
    const stepError = validateStep(activeStep);
    
    if (stepError) {
      setError(stepError);
      gooeyToast.error(stepError);
      return;
    }
    
    setError("");
    setActiveStep((current) => (current < 3 ? (current + 1) as WizardStepId : current));
  };

  const goBack = () => {
    setError("");
    setActiveStep((current) => (current > 1 ? (current - 1) as WizardStepId : current));
  };

  const goToStep = (step: WizardStepId) => {
    if (step < activeStep) {
      setError("");
      setActiveStep(step);
    } else if (step > activeStep) {
      if (step === activeStep + 1) {
        goNext();
      } else {
        gooeyToast.error("Please complete the current step before skipping ahead.");
      }
    }
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
        gooeyToast.success(`Scheduled publishing completed: ${dueTitles.join(", ")}`);
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
      gooeyToast.error("A Post Title is required before generating a preview.");
      return;
    }
    setError("");
    setPreviewOpen(true);
  };

  const createRecord = (status: PostRecordStatus): PostRecord | null => {
    const step1Error = validateStep(1);
    if (step1Error) {
      gooeyToast.error(`Step 1 Error: ${step1Error}`);
      return null;
    }
    const step2Error = validateStep(2);
    if (step2Error) {
      gooeyToast.error(`Step 2 Error: ${step2Error}`);
      return null;
    }

    if (status === "scheduled" && !scheduledAt) {
      gooeyToast.error("Please set a schedule date and time before submitting.");
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
    if (!title.trim()) {
      gooeyToast.error("A Post Title is required to save a draft.");
      return;
    }

    const record: PostRecord = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      category,
      author: author.trim() || "Unknown Author",
      excerpt: excerpt.trim(),
      contentHtml,
      status: "draft",
    };

    setRecords((current) => [record, ...current]);
    gooeyToast.success(`Draft successfully saved!`);
  };

  const handleSubmit = () => {
    const targetStatus: PostRecordStatus = publishMode === "now" ? "published" : "scheduled";
    const record = createRecord(targetStatus);
    if (!record) return;

    setRecords((current) => [record, ...current]);

    if (targetStatus === "published") {
      gooeyToast.success(`Success! "${record.title}" is now live.`);
    } else {
      gooeyToast.success(`Post safely scheduled for publishing.`);
    }
  };

  const renderFileList = (files: File[]) => {
    if (files.length === 0) return <small className="cnp-upload__empty">No file chosen</small>;

    return (
      <ul className="cnp-upload__file-list">
        {files.map((file, idx) => (
          <li key={idx} className="cnp-file-item">
            <span className="cnp-file-name" title={file.name}>{file.name}</span>
            {file.type.startsWith("image/") && (
              <button
                type="button"
                className="cnp-file-preview-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setImagePreviewUrl(URL.createObjectURL(file));
                }}
                aria-label={`Preview ${file.name}`}
              >
                <Eye size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    );
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
            <p className="cnp-page-intro__eyebrow">Structured Workflow</p>
            <h2 id="cnp-page-title" className="cnp-page-intro__title">
              {activeStepConfig.label}
            </h2>
          </div>
        </section>

        <nav className="cnp-stepper" aria-label="Post creation steps">
          <div className="cnp-stepper__track">
            <div 
              className="cnp-stepper__progress" 
              style={{ width: `${((activeStep - 1) / (creationSteps.length - 1)) * 100}%` }} 
            />
          </div>
          {creationSteps.map((step) => {
            const isActive = step.id === activeStep;
            const isCompleted = step.id < activeStep;

            return (
              <button
                key={step.id}
                type="button"
                className={`cnp-stepper__item ${isActive ? "cnp-stepper__item--active" : ""} ${isCompleted ? "cnp-stepper__item--completed" : ""}`}
                onClick={() => goToStep(step.id)}
                aria-current={isActive ? "step" : undefined}
                disabled={step.id > activeStep + 1}
              >
                <div className="cnp-stepper__node" aria-hidden="true">
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                </div>
                <div className="cnp-stepper__copy">
                  <span className="cnp-stepper__label">{step.label}</span>
                  <span className="cnp-stepper__description">{step.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <section className="cnp-layout">
          <article className="cnp-form-card">
            {activeStep === 1 && (
              <section className="cnp-step-section" aria-label="Post basics">
                <div className="cnp-step-section__head">
                  <h3>Post Basics</h3>
                  <p>Capture the core details first so the rest of the form has a clear direction.</p>
                </div>

                <label className="cnp-field">
                  <span>Post Title <span className="cnp-required">*</span></span>
                  <input
                    value={title}
                    onChange={(event) => {
                      const v = event.target.value;
                      const transformed = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
                      setTitle(transformed);
                      if (error) setError("");
                    }}
                    onBlur={() => {
                      if (title && title.length > 0) {
                        const transformed = title.charAt(0).toUpperCase() + title.slice(1);
                        setTitle(transformed);
                      }
                    }}
                    placeholder="e.g. Advancements in Quantum Computing"
                    aria-describedby="post-title-help"
                    autoCapitalize="words"
                  />
                  <small id="post-title-help">Use a clear title that will scan well in moderation and search results.</small>
                </label>

                <div className="cnp-grid-2">
                  <label className="cnp-field">
                    <span>Category <span className="cnp-required">*</span></span>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      <option value="article">Article</option>
                      <option value="research">Research</option>
                      <option value="journal">Journal</option>
                      <option value="events">Events</option>
                    </select>
                  </label>

                  <label className="cnp-field">
                    <span>Author&apos;s Name <span className="cnp-required">*</span></span>
                    <input
                      value={author}
                      onChange={(event) => {
                        const v = event.target.value;
                        const transformed = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
                        setAuthor(transformed);
                        if (error) setError("");
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
                    <span>Date &amp; Time <span className="cnp-required">*</span></span>
                    <div className="cnp-field__with-icon">
                      <CalendarDays size={16} className="cnp-field__icon" />
                      <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(event) => {
                          setDateTime(event.target.value);
                          if(error) setError("");
                        }}
                        aria-label="Post date and time"
                      />
                    </div>
                  </label>

                  <label className="cnp-field">
                    <span>Assigned Members <span className="cnp-required">*</span></span>
                    <select value={assignedMembers} onChange={(event) => {
                      setAssignedMembers(event.target.value);
                      if(error) setError("");
                    }}>
                      <option value="none">No assignment yet</option>
                      <option value="board-a">Editorial Board A</option>
                      <option value="board-b">Editorial Board B</option>
                      <option value="peer-review">Peer Review Team</option>
                    </select>
                  </label>
                </div>

                <label className="cnp-field">
                  <span>Visibility <span className="cnp-required">*</span></span>
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
                  <h3>Content & Assets</h3>
                  <p>Write the body copy and attach supporting files before the final review step.</p>
                </div>

                <label className="cnp-field">
                  <span>Excerpt <span className="cnp-required">*</span></span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={excerpt}
                    onChange={(event) => {
                      setExcerpt(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Write a short, engaging summary for readers..."
                    aria-describedby="excerpt-help"
                  />
                  <small id="excerpt-help">{excerpt.length}/500 characters.</small>
                </label>

                <section className="cnp-editor-block">
                  <div className="cnp-editor-block__head">
                    <span>Body Content <span className="cnp-required">*</span></span>
                    <div className="cnp-editor-toolbar" aria-label="Rich text controls">
                      <button type="button" onClick={() => applyFormat("bold")} aria-label="Bold">B</button>
                      <button type="button" onClick={() => applyFormat("italic")} aria-label="Italic">I</button>
                      <button type="button" onClick={() => applyFormat("underline")} aria-label="Underline">U</button>
                      <div className="cnp-editor-divider" />
                      <button type="button" onClick={() => applyFormat("insertUnorderedList")} aria-label="Bulleted list"><List size={16} /></button>
                      <button type="button" onClick={() => applyFormat("insertOrderedList")} aria-label="Numbered list"><ListOrdered size={16} /></button>
                      <div className="cnp-editor-divider" />
                      <button
                        type="button"
                        onClick={() => {
                          const link = window.prompt("Enter URL");
                          if (link) applyFormat("createLink", link);
                        }}
                        aria-label="Insert link"
                      >
                        <Link2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={editorRef}
                    className="cnp-editor"
                    contentEditable
                    onInput={() => {
                      setContentHtml(editorRef.current?.innerHTML ?? "");
                      if (error) setError("");
                    }}
                    suppressContentEditableWarning
                    data-placeholder="Begin writing your research post here..."
                    aria-label="Post content editor"
                  />
                </section>

                <div className="cnp-grid-2">
                  <label className="cnp-upload">
                    <span className="cnp-upload__title">Featured Image <span className="cnp-required">*</span></span>
                    <label htmlFor="featured-image-input" className="cnp-upload__box">
                      <div className="cnp-upload__icon-wrapper"><ImageIcon size={20} /></div>
                      <span>Click or drag image to upload</span>
                    </label>
                    <input
                      id="featured-image-input"
                      className="cnp-upload__input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => {
                        setFeaturedImageFiles(Array.from(event.target.files ?? []));
                        if(error) setError("");
                      }}
                    />
                    {renderFileList(featuredImageFiles)}
                  </label>

                  <label className="cnp-upload" style={{ opacity: category !== "events" ? 0.5 : 1 }}>
                    <span className="cnp-upload__title">
                      Proof of Payment {category === "events" && <span className="cnp-required">*</span>}
                    </span>
                    <label 
                      htmlFor="proof-files-input" 
                      className="cnp-upload__box"
                      style={{ cursor: category !== "events" ? "not-allowed" : "pointer" }}
                    >
                      <div className="cnp-upload__icon-wrapper"><FileUp size={20} /></div>
                      <span>{category === "events" ? "Upload PDF or image receipt" : "Not required for this category"}</span>
                    </label>
                    <input
                      id="proof-files-input"
                      className="cnp-upload__input"
                      type="file"
                      accept=".pdf,image/*"
                      multiple
                      disabled={category !== "events"}
                      onChange={(event) => {
                        setProofFiles(Array.from(event.target.files ?? []));
                        if(error) setError("");
                      }}
                    />
                    {category === "events" && renderFileList(proofFiles)}
                    {category !== "events" && <small className="cnp-upload__empty">No file chosen</small>}
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
                      {supportingFiles.length > 0 ? `${supportingFiles.length} file(s) selected` : "No additional files"}
                    </span>
                  </span>
                  {supportingFiles.length > 0 && renderFileList(supportingFiles)}
                </label>
              </section>
            )}

            {activeStep === 3 && (
              <section className="cnp-step-section" aria-label="Review and publish">
                <div className="cnp-step-section__head">
                  <h3>Review & Publish</h3>
                  <p>Check the publishing mode and confirm the final action for this post.</p>
                </div>

                <section className="cnp-publish-options">
                  <span>Publishing Options</span>
                  <div className="cnp-publish-radios">
                    <label className="cnp-radio-label">
                      <input type="radio" checked={publishMode === "now"} onChange={() => setPublishMode("now")} />
                      Publish immediately
                    </label>
                    <label className="cnp-radio-label">
                      <input type="radio" checked={publishMode === "schedule"} onChange={() => setPublishMode("schedule")} />
                      Schedule for later
                    </label>
                  </div>

                  {publishMode === "schedule" && (
                    <div className="cnp-schedule-input">
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(event) => {
                          setScheduledAt(event.target.value);
                          if(error) setError("");
                        }}
                        aria-label="Scheduled publish date and time"
                      />
                    </div>
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

            {error && (
              <div className="cnp-error-banner" role="alert">
                {error}
              </div>
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
                <button type="button" className="cnp-btn cnp-btn--ghost" onClick={handleSaveDraft}>
                  Save Draft
                </button>
                {activeStep === 3 && (
                  <button type="button" className="cnp-btn cnp-btn--primary" onClick={handleSubmit}>
                    {publishMode === "schedule" ? "Schedule Post" : "Publish Now"}
                  </button>
                )}
              </div>
            </div>
          </article>

          <aside className="cnp-sidecard">
            <section className="cnp-side-block">
              <h3>Submission Info</h3>
              <div className="cnp-side-block__row">
                <span>Status:</span> <strong>{statusLabel}</strong>
              </div>
              <div className="cnp-side-block__row">
                <span>Submitted By:</span> <strong>{author || "N/A"}</strong>
              </div>
              <div className="cnp-side-block__row">
                <span>Panel:</span> <strong>National Board</strong>
              </div>
              <div className="cnp-side-block__row">
                <span>Visibility:</span> <strong className="capitalize">{visibility}</strong>
              </div>
            </section>

            <section className="cnp-side-block cnp-side-block--info">
              <h4>Publishing Info</h4>
              <ol>
                <li>As an admin, your posts are published immediately without approval.</li>
                <li>Published posts will be visible to all users on the main page.</li>
                <li>You can edit or delete published posts from user management section.</li>
              </ol>
            </section>

            <div className="cnp-help-box" role="note" aria-label="Author guidelines">
              <p>Need help with post formatting?</p>
              <a className="cnp-help-link" href="/author-guidelines">Read Author Guidelines &rarr;</a>
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
                <X size={20} />
              </button>
            </div>
            
            <div className="cnp-preview__body">
              <h3 className="cnp-preview__title">{title || "Untitled Post"}</h3>
              <p className="cnp-preview__meta"><span className="capitalize">{category}</span> • {author || "Unknown Author"}</p>
              
              <div className="cnp-preview__excerpt">
                <p>{excerpt || "No excerpt yet."}</p>
              </div>

              <div
                className="cnp-preview__content"
                dangerouslySetInnerHTML={{ __html: contentHtml || "<p>No content yet.</p>" }}
              />
            </div>
          </article>
        </section>
      )}

      {/* NEW IMAGE PREVIEW MODAL */}
      {imagePreviewUrl && (
        <section 
          className="cnp-image-modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          onClick={() => setImagePreviewUrl(null)}
        >
          <div className="cnp-image-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="cnp-image-modal__close" onClick={() => setImagePreviewUrl(null)}>
              <X size={20} />
            </button>
            <img src={imagePreviewUrl} alt="File Preview" className="cnp-image-modal__img" />
          </div>
        </section>
      )}
    </>
  );
}