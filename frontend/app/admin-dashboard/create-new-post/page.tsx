"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, FileUp, Image as ImageIcon, Link2, List, ListOrdered, X, Check, Loader2 } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { gooeyToast } from "goey-toast"; 
import "goey-toast/styles.css";
import "./create-new-post.css";
import "../admin-dashboard.css";
import { api } from "../../lib/api-client";

type PublishMode = "now" | "schedule";
type PostRecordStatus = "draft" | "pending" | "published" | "scheduled";

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
  createdAt: string;
};

export default function CreateNewPostPage() {
  const router = useRouter();

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
  const [isLoading, setIsLoading] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);

  // Fetch recent posts to display in the sidebar
  const fetchRecentPosts = async () => {
    try {
      const response = await api.get('/posts');
      const postsList = Array.isArray(response.data) ? response.data : [];
      const mapped: PostRecord[] = postsList.map((post: any) => ({
        id: post.id.toString(),
        title: post.title,
        category: post.category,
        author: post.author || "Unknown",
        excerpt: post.excerpt || "",
        contentHtml: post.content_html || "",
        status: post.status,
        createdAt: new Date(post.created_at).toLocaleString(),
      }));
      setRecords(mapped);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const validateForm = (isDraft: boolean): string | null => {
    if (isDraft) {
      if (!title.trim()) return "Please enter a Post Title to save a draft.";
      return null;
    }

    if (!title.trim()) return "Please enter a Post Title.";
    if (!category.trim()) return "Please select a Category.";
    if (!author.trim()) return "Please enter an Author's Name.";
    if (!dateTime.trim()) return "Please set a Date & Time.";
    if (assignedMembers === "none") return "Please assign members to this post.";
    if (!visibility.trim()) return "Please select a Visibility setting.";
    if (!excerpt.trim()) return "An excerpt is required for the preview card.";
    
    const strippedContent = contentHtml.replace(/<[^>]*>?/gm, '').trim();
    if (!strippedContent) return "The body content cannot be empty.";

    if (featuredImageFiles.length === 0) return "Please upload a Featured Image.";
    
    if (category === "events" && proofFiles.length === 0) {
      return "Please upload Proof of Payment for this event.";
    }

    if (publishMode === "schedule" && !scheduledAt) {
      return "Please select a Date & Time for scheduling.";
    }

    return null;
  };

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

  const handleSaveDraft = async () => {
    const validationError = validateForm(true);
    if (validationError) {
      setError(validationError);
      gooeyToast.error(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("content_html", contentHtml);
      formData.append("excerpt", excerpt.trim());
      formData.append("assigned_members", assignedMembers);
      formData.append("status", "draft");

      if (featuredImageFiles[0]) {
        formData.append("featured_image", featuredImageFiles[0]);
      }
      if (proofFiles[0] && category === "events") {
        formData.append("proof_of_payment", proofFiles[0]);
      }
      if (supportingFiles[0]) {
        formData.append("supporting_file", supportingFiles[0]);
      }

      const res = await api.postMultipart("/posts", formData);
      gooeyToast.success(res.message || "Draft successfully saved!");
      
      // Clear and reload
      setTitle("");
      setExcerpt("");
      setContentHtml("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      setFeaturedImageFiles([]);
      setProofFiles([]);
      setSupportingFiles([]);
      
      fetchRecentPosts();
    } catch (err: any) {
      gooeyToast.error(err.message || "Failed to save draft.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateForm(false);
    if (validationError) {
      setError(validationError);
      gooeyToast.error(validationError);
      return;
    }

    const targetStatus = publishMode === "now" ? "published" : "draft"; // Backend default for moderation/schedules

    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("content_html", contentHtml);
      formData.append("excerpt", excerpt.trim());
      formData.append("assigned_members", assignedMembers);
      formData.append("status", targetStatus);

      if (publishMode === "schedule" && scheduledAt) {
        formData.append("scheduled_at", scheduledAt);
      }

      if (featuredImageFiles[0]) {
        formData.append("featured_image", featuredImageFiles[0]);
      }
      if (proofFiles[0] && category === "events") {
        formData.append("proof_of_payment", proofFiles[0]);
      }
      if (supportingFiles[0]) {
        formData.append("supporting_file", supportingFiles[0]);
      }

      const res = await api.postMultipart("/posts", formData);
      gooeyToast.success(res.message || "Post successfully submitted!");
      
      // Reset form fields
      setTitle("");
      setExcerpt("");
      setContentHtml("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      setFeaturedImageFiles([]);
      setProofFiles([]);
      setSupportingFiles([]);
      
      fetchRecentPosts();
    } catch (err: any) {
      gooeyToast.error(err.message || "Failed to submit post.");
    } finally {
      setIsLoading(false);
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
    <AdminSidebarLayout
      pageClassName="cnp-page"
      mainClassName="cnp-main"
      title="Create New Post"
      subtitle="Build your post, attach resources, and schedule or publish instantly."
    >
      <section className="cnp-content">
        <section className="cnp-layout">
          {/* Main Card */}
          <article className="cnp-card">
            <div className="cnp-card__section-title">
              <h3>Post Basics</h3>
              <p>Setup the metadata, authorship, and targeting parameters of this post.</p>
            </div>

            <div className="cnp-field">
              <span>Post Title <span className="cnp-required">*</span></span>
              <input
                value={title}
                onChange={(event) => {
                  const v = event.target.value;
                  const transformed = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
                  setTitle(transformed);
                  if (error) setError("");
                }}
                placeholder="e.g. Advancements in Graduate Education"
              />
            </div>

            <div className="cnp-grid-2">
              <div className="cnp-field">
                <span>Category <span className="cnp-required">*</span></span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="article">Article</option>
                  <option value="research">Research</option>
                  <option value="journal">Journal</option>
                  <option value="events">Events</option>
                </select>
              </div>

              <div className="cnp-field">
                <span>Author&apos;s Name <span className="cnp-required">*</span></span>
                <input
                  value={author}
                  onChange={(event) => {
                    const v = event.target.value;
                    const transformed = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
                    setAuthor(transformed);
                    if (error) setError("");
                  }}
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="cnp-grid-2">
              <div className="cnp-field">
                <span>Date &amp; Time <span className="cnp-required">*</span></span>
                <div className="cnp-field__with-icon">
                  <CalendarDays size={14} className="cnp-field__icon" />
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(event) => {
                      setDateTime(event.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>
              </div>

              <div className="cnp-field">
                <span>Assigned Members <span className="cnp-required">*</span></span>
                <select value={assignedMembers} onChange={(event) => {
                  setAssignedMembers(event.target.value);
                  if (error) setError("");
                }}>
                  <option value="none">Select Assignment</option>
                  <option value="board-a">Editorial Board A</option>
                  <option value="board-b">Editorial Board B</option>
                  <option value="peer-review">Peer Review Team</option>
                </select>
              </div>
            </div>

            <div className="cnp-field">
              <span>Visibility <span className="cnp-required">*</span></span>
              <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                <option value="public">Public</option>
                <option value="members">Members only</option>
                <option value="review">Review queue</option>
              </select>
            </div>

            <div className="cnp-card__divider" />

            <div className="cnp-card__section-title">
              <h3>Content &amp; Assets</h3>
              <p>Compose the summary copy, details, and upload supporting media attachments.</p>
            </div>

            <div className="cnp-field">
              <span>Excerpt <span className="cnp-required">*</span></span>
              <textarea
                rows={3}
                maxLength={500}
                value={excerpt}
                onChange={(event) => {
                  setExcerpt(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Write a short summary that introduces your post..."
              />
              <small>{excerpt.length}/500 characters.</small>
            </div>

            <div className="cnp-editor-block">
              <div className="cnp-editor-head">
                <span>Body Content <span className="cnp-required">*</span></span>
                <div className="cnp-toolbar" aria-label="Rich text controls">
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
                className="cnp-editor"
                contentEditable
                onInput={() => {
                  setContentHtml(editorRef.current?.innerHTML ?? "");
                  if (error) setError("");
                }}
                suppressContentEditableWarning
                data-placeholder="Begin writing your post content here..."
              />
            </div>

            <div className="cnp-upload-grid">
              <div className="cnp-upload">
                <span>Featured Image <span className="cnp-required">*</span></span>
                <label htmlFor="featured-image-input" className="cnp-upload__box">
                  <ImageIcon size={18} />
                  Click or drag image to upload
                </label>
                <input
                  id="featured-image-input"
                  className="cnp-upload__input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setFeaturedImageFiles(Array.from(event.target.files ?? []));
                    if (error) setError("");
                  }}
                />
                {renderFileList(featuredImageFiles)}
              </div>

              <div className="cnp-upload" style={{ opacity: category !== "events" ? 0.5 : 1 }}>
                <span>Proof of Payment {category === "events" && <span className="cnp-required">*</span>}</span>
                <label
                  htmlFor="proof-files-input"
                  className="cnp-upload__box"
                  style={{ cursor: category !== "events" ? "not-allowed" : "pointer" }}
                >
                  <FileUp size={18} />
                  {category === "events" ? "Upload receipt (PDF/Image)" : "Not required for this category"}
                </label>
                <input
                  id="proof-files-input"
                  className="cnp-upload__input"
                  type="file"
                  accept=".pdf,image/*"
                  disabled={category !== "events"}
                  onChange={(event) => {
                    setProofFiles(Array.from(event.target.files ?? []));
                    if (error) setError("");
                  }}
                />
                {category === "events" && renderFileList(proofFiles)}
              </div>
            </div>

            <div className="cnp-field">
              <span>Supporting Files</span>
              <div className="cnp-supporting-row">
                <input
                  id="supporting-files-input"
                  className="cnp-upload__input"
                  type="file"
                  onChange={(event) => setSupportingFiles(Array.from(event.target.files ?? []))}
                />
                <label htmlFor="supporting-files-input" className="cnp-supporting-btn">
                  Choose File
                </label>
                <span className="cnp-supporting-text">
                  {supportingFiles.length > 0 ? supportingFiles[0].name : "No additional files"}
                </span>
              </div>
              {supportingFiles.length > 0 && renderFileList(supportingFiles)}
            </div>

            {error && <p className="cnp-error">{error}</p>}
          </article>

          {/* Right Sidebar Column */}
          <aside className="cnp-side">
            <section className="cnp-side-block">
              <h3>Publishing Options</h3>
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
                      if (error) setError("");
                    }}
                  />
                </div>
              )}
            </section>

            <section className="cnp-side-block">
              <h3>Actions</h3>
              <div className="cnp-actions-stack">
                <button
                  type="button"
                  className="cnp-btn cnp-btn--primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    publishMode === "schedule" ? "Schedule Post" : "Publish Now"
                  )}
                </button>

                <button
                  type="button"
                  className="cnp-btn cnp-btn--secondary"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  className="cnp-btn cnp-btn--outline"
                  onClick={handleOpenPreview}
                  disabled={isLoading}
                >
                  <Eye size={13} /> Preview News
                </button>
              </div>
            </section>

            <section className="cnp-side-block">
              <h3>Recent Submissions</h3>
              <div className="cnp-records">
                {records.slice(0, 4).map((record) => (
                  <article key={record.id} className="cnp-record-item">
                    <p>{record.title}</p>
                    <span>{record.status.toUpperCase()} • {record.createdAt}</span>
                  </article>
                ))}
                {records.length === 0 && <p className="cnp-empty">No submissions yet.</p>}
              </div>
            </section>

            <section className="cnp-side-block cnp-side-block--info">
              <h3>Submission Status</h3>
              <p><strong>Published Posts:</strong> {records.filter((r) => r.status === "published").length}</p>
              <p><strong>Drafts:</strong> {records.filter((r) => r.status === "draft").length}</p>
            </section>
          </aside>
        </section>
      </section>

      {/* Preview Modal */}
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
            <p className="cnp-preview__meta">{category} • By {author}</p>
            <div
              className="cnp-preview__content"
              dangerouslySetInnerHTML={{ __html: contentHtml || "<p>No content yet.</p>" }}
            />
            {featuredImageFiles.length > 0 && (
              <p className="cnp-preview__files">
                Featured: {featuredImageFiles.map(f => f.name).join(", ")}
              </p>
            )}
          </article>
        </section>
      )}

      {/* Image Preview Modal */}
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
    </AdminSidebarLayout>
  );
}