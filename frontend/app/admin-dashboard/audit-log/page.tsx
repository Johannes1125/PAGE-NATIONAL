"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { api } from "../../lib/api-client";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldAlert,
  Clock,
  UserRound,
  Edit,
  X,
  Check,
  List,
  ListOrdered,
  Trash2,
  Filter,
  BarChart3,
  Globe,
  FileCheck,
  XOctagon,
  Eye,
  Image as ImageIcon,
  BookOpen,
  Newspaper,
  FileText
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import AdminTypewriterLoader from "../../lib/admin-loader/AdminTypewriterLoader";
import { gooeyToast } from "goey-toast"; 
import "goey-toast/styles.css";
import "./audit-log.css";
import "../admin-dashboard.css";

type LogCategory = "instant" | "approval";
type PostStatus = "Published" | "Approved" | "Pending" | "Rejected";

type PostData = {
  title: string;
  category: string;
  author: string;
  date: string;
  endDate?: string; 
  assigned: string;
  visibility: string;
  excerpt: string;
  contentHtml: string;
};

type AuditLogEntry = {
  id: string;
  date: string;
  time: string;
  adminName: string;
  actionType: string;
  status: PostStatus;
  targetEntity: string;
  logCategory: LogCategory;
  postData: PostData;
};

const initialLogs: AuditLogEntry[] = [
  {
    id: "log-1042",
    date: "Jun 01, 2026",
    time: "14:05 PST",
    adminName: "National Admin",
    actionType: "INSTANT PUBLISH",
    status: "Published",
    targetEntity: "National Guidelines for 2026 Academic Submissions",
    logCategory: "instant",
    postData: {
      title: "National Guidelines for 2026 Academic Submissions",
      category: "news",
      author: "National Admin",
      date: "2026-06-01T14:00",
      assigned: "none",
      visibility: "public",
      excerpt: "An overview of the new submission guidelines for the upcoming academic year.",
      contentHtml: "<p>These are the official national guidelines...</p>",
    }
  },
  {
    id: "log-1041",
    date: "Jun 01, 2026",
    time: "11:30 PST",
    adminName: "Dr. Reyes (Editor)",
    actionType: "MODERATION",
    status: "Approved",
    targetEntity: "Innovative Approaches to Online Education",
    logCategory: "approval",
    postData: {
      title: "Innovative Approaches to Online Education",
      category: "article",
      author: "Dr. Elena Rodriguez",
      date: "2026-05-20T09:00",
      assigned: "board-a",
      visibility: "public",
      excerpt: "A peer-reviewed study examining mentorship challenges...",
      contentHtml: "<p>Mentorship in online spaces requires...</p>",
    }
  },
  {
    id: "log-1040",
    date: "May 31, 2026",
    time: "09:15 PST",
    adminName: "System Automation",
    actionType: "INSTANT PUBLISH",
    status: "Published",
    targetEntity: "Annual Symposium 2026",
    logCategory: "instant",
    postData: {
      title: "Annual Symposium 2026",
      category: "events",
      author: "IT Infrastructure",
      date: "2026-06-05T09:00",
      endDate: "2026-06-07T17:00",
      assigned: "none",
      visibility: "public",
      excerpt: "Join us for the 2026 National Symposium on Scientific Research.",
      contentHtml: "<p>Please ensure all pending reviews are saved...</p>",
    }
  },
  {
    id: "log-1039",
    date: "May 30, 2026",
    time: "16:45 PST",
    adminName: "National Admin",
    actionType: "MODERATION",
    status: "Approved",
    targetEntity: "AI-Assisted Literature Mapping",
    logCategory: "approval",
    postData: {
      title: "AI-Assisted Literature Mapping",
      category: "research",
      author: "Dr. Angela Reyes",
      date: "2026-05-18T10:30",
      assigned: "peer-review",
      visibility: "members",
      excerpt: "Explores guided AI workflows for early-stage literature mapping...",
      contentHtml: "<p>Integrating AI into literature reviews...</p>",
    }
  }
];

type WizardStepId = 1 | 2 | 3;
const wizardSteps = [
  { id: 1 as WizardStepId, label: "Metadata", description: "Authorship & timeline." },
  { id: 2 as WizardStepId, label: "Manuscript", description: "Abstract & attachments." },
  { id: 3 as WizardStepId, label: "Verification", description: "Review & finalize." },
] as const;

// Helper to format ISO dates into sleek UI strings: "Jun 05 • 09:00 AM"
const formatEventDate = (isoStr: string) => {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr; 
  
  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} • ${timePart}`;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<LogCategory>("instant");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [editingLogId, setEditingPostId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<WizardStepId>(1);
  const [modalError, setModalError] = useState("");
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("article");
  const [author, setAuthor] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState(""); 
  const [assignedMembers, setAssignedMembers] = useState("none");
  const [visibility, setVisibility] = useState("public");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [featuredImageFiles, setFeaturedImageFiles] = useState<File[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/posts');
      const mapped: AuditLogEntry[] = response.posts.map((post: any) => {
        const isInstant = post.status === 'published' && (!post.assigned_members || post.assigned_members === 'none');
        return {
          id: post.id.toString(),
          date: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          time: new Date(post.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + " PST",
          adminName: post.author || "System",
          actionType: isInstant ? "INSTANT PUBLISH" : "MODERATION",
          status: (post.status.charAt(0).toUpperCase() + post.status.slice(1)) as PostStatus,
          targetEntity: post.title,
          logCategory: isInstant ? "instant" : "approval",
          postData: {
            title: post.title,
            category: post.category,
            author: post.author || "System",
            date: post.created_at ? post.created_at.slice(0, 16) : "",
            endDate: post.scheduled_at ? post.scheduled_at.slice(0, 16) : undefined,
            assigned: post.assigned_members || "none",
            visibility: post.visibility || "public",
            excerpt: post.excerpt || "",
            contentHtml: post.content_html || "",
          }
        };
      });
      setLogs(mapped);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      gooeyToast.error("Failed to load records from Supabase database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      published: logs.filter(l => l.status === "Published").length,
      approved: logs.filter(l => l.status === "Approved").length,
      rejected: logs.filter(l => l.status === "Rejected").length,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter((log) => {
      const matchesTab = log.logCategory === activeTab;
      const matchesSearch =
        log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || log.postData.category.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesTab && matchesSearch && matchesCategory;
    });

    if (sortOrder === "OLDEST") {
      result = [...result].reverse();
    }
    return result;
  }, [logs, activeTab, searchQuery, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

  const pagedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [currentPage, filteredLogs]);

  const visiblePages = useMemo(() => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 3);
    if (end - start < 3) start = Math.max(1, end - 3);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  useEffect(() => setCurrentPage(1), [activeTab, searchQuery, categoryFilter]);

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this record? This action cannot be undone.")) {
      try {
        setIsLoading(true);
        await api.delete(`/posts/${id}`);
        setLogs((current) => current.filter((log) => log.id !== id));
        gooeyToast.success("Record permanently removed from the database.");
      } catch (err) {
        console.error("Failed to delete post", err);
        gooeyToast.error("Failed to delete record from database.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = (log: AuditLogEntry) => {
    setEditingPostId(log.id);
    setActiveStep(1);
    setModalError("");
    
    setTitle(log.postData.title);
    setCategory(log.postData.category);
    setAuthor(log.postData.author);
    setDateTime(log.postData.date);
    setEndDateTime(log.postData.endDate ?? "");
    setAssignedMembers(log.postData.assigned);
    setVisibility(log.postData.visibility);
    setExcerpt(log.postData.excerpt);
    setContentHtml(log.postData.contentHtml);
    setFeaturedImageFiles([]);
  };

  const closeEditModal = () => {
    setEditingPostId(null);
    setImagePreviewUrl(null);
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    setContentHtml(editorRef.current?.innerHTML ?? "");
  };

  const validateStep = (step: WizardStepId): string | null => {
    if (step === 1) {
      if (!title.trim()) return "Please enter a Post Title.";
      if (!author.trim()) return "Please enter an Author's Name.";
      if (!dateTime.trim()) return "Please set a Start Date & Time.";
      if (category === "events" && !endDateTime.trim()) return "Please set an End Date & Time for this event.";
    }
    if (step === 2) {
      if (!excerpt.trim()) return "An abstract/excerpt is required.";
      const strippedContent = contentHtml.replace(/<[^>]*>?/gm, '').trim();
      if (!strippedContent) return "The manuscript body cannot be empty.";
    }
    return null;
  };

  const goNext = () => {
    const stepError = validateStep(activeStep);
    if (stepError) {
      setModalError(stepError);
      return;
    }
    setModalError("");
    setActiveStep((current) => (current < 3 ? (current + 1) as WizardStepId : current));
  };

  const goBack = () => {
    setModalError("");
    setActiveStep((current) => (current > 1 ? (current - 1) as WizardStepId : current));
  };

  const goToStep = (step: WizardStepId) => {
    if (step < activeStep) {
      setModalError("");
      setActiveStep(step);
    } else if (step === activeStep + 1) {
      goNext();
    } else if (step > activeStep + 1) {
      setModalError("Please complete the current step before skipping ahead.");
    }
  };

  const handleSaveChanges = async () => {
    const stepError = validateStep(1) || validateStep(2);
    if (stepError) {
      gooeyToast.error("Validation failed. Please check your inputs.");
      return;
    }

    try {
      setIsLoading(true);
      const post = logs.find(l => l.id === editingLogId);
      const targetStatus = post ? post.status.toLowerCase() : "published";

      const res = await api.put(`/posts/${editingLogId}`, {
        title,
        category,
        content_html: contentHtml,
        excerpt,
        assigned_members: assignedMembers,
        status: targetStatus,
      });

      if (res.success) {
        setLogs((currentLogs) => 
          currentLogs.map(log => 
            log.id === editingLogId 
              ? {
                  ...log,
                  targetEntity: title, 
                  postData: {
                    ...log.postData,
                    title, category, author, date: dateTime, endDate: category === "events" ? endDateTime : undefined, assigned: assignedMembers, visibility, excerpt, contentHtml
                  }
                } 
              : log
          )
        );
        gooeyToast.success("Manuscript data successfully updated.");
        closeEditModal();
      }
    } catch (err) {
      console.error("Failed to update post", err);
      gooeyToast.error("Failed to update post in database.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileList = (files: File[]) => {
    if (files.length === 0) return <small className="cnp-upload__empty">No image chosen</small>;

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

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'events': return <CalendarDays size={14} />;
      case 'news': return <Newspaper size={14} />;
      case 'journal': return <BookOpen size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const formatDateTimeStr = (isoStr: string) => {
    if (!isoStr) return { date: "—", time: "" };
    const parts = isoStr.split("T");
    return { date: parts[0], time: parts[1] ? ` @ ${parts[1]}` : "" };
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="audit-page"
        mainClassName="audit-main"
        title="National Post Directory"
        subtitle="Manage, audit, and modify published records across the research portal."
        eyebrow="Database Management"
      >
        <AdminTypewriterLoader label="Loading national post directory..." />
      </AdminSidebarLayout>
    );
  }

  return (
    <>
      <AdminSidebarLayout
        pageClassName="audit-page"
        mainClassName="audit-main"
        title="National Post Directory"
        subtitle="Manage, audit, and modify published records across the research portal."
        eyebrow="Database Management"
      >
        <section className="audit-content">

          {/* 1. Status Cards */}
          <div className="audit-stats-grid">
            <div className="audit-stat-card audit-stat-card--accent-navy">
              <div className="audit-stat-icon audit-stat-icon--total"><BarChart3 size={22} /></div>
              <div className="audit-stat-info">
                <span className="audit-stat-label">Total Records</span>
                <span className="audit-stat-value">{stats.total}</span>
              </div>
            </div>
            <div className="audit-stat-card audit-stat-card--accent-blue">
              <div className="audit-stat-icon audit-stat-icon--published"><Globe size={22} /></div>
              <div className="audit-stat-info">
                <span className="audit-stat-label">Instant Published</span>
                <span className="audit-stat-value">{stats.published}</span>
              </div>
            </div>
            <div className="audit-stat-card audit-stat-card--accent-green">
              <div className="audit-stat-icon audit-stat-icon--approved"><FileCheck size={22} /></div>
              <div className="audit-stat-info">
                <span className="audit-stat-label">Moderated</span>
                <span className="audit-stat-value">{stats.approved}</span>
              </div>
            </div>
            <div className="audit-stat-card audit-stat-card--accent-red">
              <div className="audit-stat-icon audit-stat-icon--rejected"><XOctagon size={22} /></div>
              <div className="audit-stat-info">
                <span className="audit-stat-label">Revisions</span>
                <span className="audit-stat-value">{stats.rejected}</span>
              </div>
            </div>
          </div>
          
          {/* 2. Research Standard Tabs */}
          <div className="audit-header-area">
            <div className="audit-tabs">
              <button 
                className={`audit-tab ${activeTab === 'instant' ? 'audit-tab--active' : ''}`}
                onClick={() => setActiveTab('instant')}
              >
                Instant Publications
              </button>
              <button 
                className={`audit-tab ${activeTab === 'approval' ? 'audit-tab--active' : ''}`}
                onClick={() => setActiveTab('approval')}
              >
                Moderated Submissions
              </button>
            </div>
          </div>

          {/* 3. Control Bar */}
          <div className="audit-toolbar-card">
            <div className="audit-toolbar__search">
              <Search size={16} className="audit-toolbar__search-icon" />
              <input 
                type="text" 
                placeholder="Search manuscripts, authors, or IDs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="audit-toolbar__filters">
              <div className="audit-filter-group">
                <Filter size={14} className="audit-filter-icon" />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="audit-select">
                  <option value="ALL">All Document Types</option>
                  <option value="article">Article</option>
                  <option value="events">Event</option>
                  <option value="journal">Journal</option>
                  <option value="news">News</option>
                  <option value="research">Research</option>
                </select>
              </div>

              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="audit-select audit-select--sort">
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
              </select>
            </div>
          </div>

          {/* 4. Grid Table */}
          <div className="audit-list-container">
            <div className="audit-list-header">
              <div className="audit-col audit-col--header">Timeline window</div>
              <div className="audit-col audit-col--header">Author / Registrar</div>
              <div className="audit-col audit-col--header">Document Type</div>
              <div className="audit-col audit-col--details-header">Manuscript Title</div>
              <div className="audit-col audit-col--header">Actions</div>
            </div>

            <div className="audit-list">
              {pagedLogs.map((log) => {
                const isEvent = log.postData.category === "events";
                return (
                  <div key={log.id} className="audit-row">
                    
                    {/* Centered Timeline Window Column */}
                    <div className="audit-col audit-col--time">
                      <div className="audit-time-stack">
                        {isEvent && log.postData.endDate ? (
                          <>
                            <div className="audit-dt-row">
                              <span className="audit-dt-badge">START</span>
                              <span className="audit-dt-value">{formatEventDate(log.postData.date)}</span>
                            </div>
                            <div className="audit-dt-row audit-dt-row--muted">
                              <span className="audit-dt-badge audit-dt-badge--muted">END</span>
                              <span className="audit-dt-value">{formatEventDate(log.postData.endDate)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="audit-dt-row">
                              <div className="audit-dt-icon-wrapper"><CalendarDays size={14} className="audit-icon-muted" /></div>
                              <span className="audit-dt-value">{log.date}</span>
                            </div>
                            <div className="audit-dt-row audit-dt-row--muted">
                              <div className="audit-dt-icon-wrapper"><Clock size={14} className="audit-icon-muted" /></div>
                              <span className="audit-dt-value">{log.time}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="audit-col audit-col--user">
                      <div className="audit-user-box">
                        <UserRound size={16} className="audit-icon-muted" />
                        <span className="audit-user-text">{log.adminName}</span>
                      </div>
                    </div>

                    <div className="audit-col audit-col--type">
                      <span className="audit-type-badge">
                        {getCategoryIcon(log.postData.category)}
                        {log.postData.category}
                      </span>
                    </div>
                    
                    <div className="audit-col audit-col--details">
                      <strong className="audit-target-entity" title={log.targetEntity}>
                        {log.targetEntity}
                      </strong>
                    </div>
                    
                    <div className="audit-col audit-col--controls">
                      <button className="audit-btn-action audit-btn-action--edit" onClick={() => openEditModal(log)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="audit-btn-action audit-btn-action--delete" onClick={() => handleDeletePost(log.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>

                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="audit-empty-state">
                  <ShieldAlert size={40} className="audit-empty-icon" />
                  <h3>No records found</h3>
                  <p>Try adjusting your search or filter settings to find what you're looking for.</p>
                </div>
              )}
            </div>
          </div>

          {/* 5. Pagination */}
          {filteredLogs.length > 0 && (
            <nav className="audit-pagination">
              <button
                type="button"
                className="audit-pagination__nav"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="audit-pagination__pages">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`audit-pagination__page ${page === currentPage ? "audit-pagination__page--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="audit-pagination__nav"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </section>
      </AdminSidebarLayout>

      {/* EDIT MODAL (THE WIZARD) */}
      {editingLogId && (
        <div className="audit-modal-backdrop" role="dialog" aria-modal="true">
          <div className="audit-modal">
            <div className="audit-modal__header">
              <div>
                <h2 className="audit-modal__title">Modify Manuscript Record</h2>
                <p className="audit-modal__subtitle">Database ID: {editingLogId}</p>
              </div>
              <button className="audit-modal__close" onClick={closeEditModal}><X size={20}/></button>
            </div>

            <div className="audit-modal__body">
              <nav className="cnp-stepper">
                <div className="cnp-stepper__track">
                  <div 
                    className="cnp-stepper__progress" 
                    style={{ width: `${((activeStep - 1) / (wizardSteps.length - 1)) * 100}%` }} 
                  />
                </div>
                {wizardSteps.map((step) => {
                  const isActive = step.id === activeStep;
                  const isCompleted = step.id < activeStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={`cnp-stepper__item ${isActive ? "cnp-stepper__item--active" : ""} ${isCompleted ? "cnp-stepper__item--completed" : ""}`}
                      onClick={() => goToStep(step.id)}
                      disabled={step.id > activeStep + 1}
                    >
                      <div className="cnp-stepper__node">{isCompleted ? <Check size={16} strokeWidth={3}/> : step.id}</div>
                      <div className="cnp-stepper__copy">
                        <span className="cnp-stepper__label">{step.label}</span>
                        <span className="cnp-stepper__description">{step.description}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Step 1: Basics / Metadata */}
              {activeStep === 1 && (
                <div className="audit-modal-step">
                  <label className="cnp-field">
                    <span>Manuscript Title <span className="cnp-required">*</span></span>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </label>
                  <div className="cnp-grid-2">
                    <label className="cnp-field">
                      <span>Document Type</span>
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="article">Article</option>
                        <option value="research">Research</option>
                        <option value="journal">Journal</option>
                        <option value="events">Events</option>
                        <option value="news">News</option>
                        <option value="announcement">Announcement</option>
                      </select>
                    </label>
                    <label className="cnp-field">
                      <span>Primary Author <span className="cnp-required">*</span></span>
                      <input value={author} onChange={(e) => setAuthor(e.target.value)} />
                    </label>
                  </div>

                  {/* Conditional rendering for events timeline windows */}
                  {category === "events" ? (
                    <div className="cnp-grid-2 cnp-event-window-pane">
                      <label className="cnp-field">
                        <span>Event Start Window <span className="cnp-required">*</span></span>
                        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                      </label>
                      <label className="cnp-field">
                        <span>Event End Window <span className="cnp-required">*</span></span>
                        <input type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} />
                      </label>
                    </div>
                  ) : (
                    <div className="cnp-grid-2">
                      <label className="cnp-field">
                        <span>Publication Date <span className="cnp-required">*</span></span>
                        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                      </label>
                      <label className="cnp-field">
                        <span>Archive Visibility</span>
                        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                          <option value="public">Open Access (Public)</option>
                          <option value="members">Institutional Access Only</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Content & Featured Image */}
              {activeStep === 2 && (
                <div className="audit-modal-step">
                  <label className="cnp-field">
                    <span>Abstract (Excerpt) <span className="cnp-required">*</span></span>
                    <textarea rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                  </label>

                  {/* ONLY show image uploader if category is strictly 'events' */}
                  {category === "events" && (
                    <label className="cnp-upload">
                      <span className="cnp-upload__title">Event Featured Image (Optional)</span>
                      <label htmlFor="featured-image-input" className="cnp-upload__box">
                        <div className="cnp-upload__icon-wrapper"><ImageIcon size={20} /></div>
                        <span>Click or drag image to upload and preview</span>
                      </label>
                      <input
                        id="featured-image-input"
                        className="cnp-upload__input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setFeaturedImageFiles(Array.from(e.target.files ?? []))}
                      />
                      {renderFileList(featuredImageFiles)}
                    </label>
                  )}
                  
                  <section className="cnp-editor-block">
                    <div className="cnp-editor-block__head">
                      <span>Full Manuscript Body <span className="cnp-required">*</span></span>
                      <div className="cnp-editor-toolbar">
                        <button type="button" onClick={() => applyFormat("bold")}>B</button>
                        <button type="button" onClick={() => applyFormat("italic")}>I</button>
                        <button type="button" onClick={() => applyFormat("underline")}>U</button>
                        <div className="cnp-editor-divider" />
                        <button type="button" onClick={() => applyFormat("insertUnorderedList")}><List size={16}/></button>
                        <button type="button" onClick={() => applyFormat("insertOrderedList")}><ListOrdered size={16}/></button>
                      </div>
                    </div>
                    <div
                      ref={editorRef}
                      className="cnp-editor"
                      contentEditable
                      onInput={() => setContentHtml(editorRef.current?.innerHTML ?? "")}
                      dangerouslySetInnerHTML={{ __html: contentHtml }}
                      suppressContentEditableWarning
                    />
                  </section>
                </div>
              )}

              {/* Step 3: Review */}
              {activeStep === 3 && (
                <div className="audit-modal-step">
                  <div className="cnp-review-grid">
                    <article><span>Title</span><strong>{title}</strong></article>
                    <article><span>Category</span><strong className="capitalize">{category}</strong></article>
                    <article><span>Author</span><strong>{author}</strong></article>
                    <article>
                      <span>Timeline Details</span>
                      <strong>
                        {category === "events" 
                          ? `Duration: ${formatEventDate(dateTime)} to ${formatEventDate(endDateTime)}` 
                          : `Published: ${formatEventDate(dateTime)}`
                        }
                      </strong>
                    </article>
                  </div>
                </div>
              )}

              {modalError && <div className="cnp-error-banner">{modalError}</div>}
            </div>

            <div className="audit-modal__footer">
              <button className="cnp-btn cnp-btn--secondary" onClick={goBack} disabled={activeStep === 1}>Back</button>
              {activeStep < 3 ? (
                <button className="cnp-btn cnp-btn--primary" onClick={goNext}>Continue</button>
              ) : (
                <button className="cnp-btn cnp-btn--primary" onClick={handleSaveChanges}>Update Record</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
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