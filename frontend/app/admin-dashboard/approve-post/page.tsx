"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserRound,
  FileText,
  BookOpen,
  Check // <-- Added missing import here!
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { gooeyToast } from "goey-toast"; 
import "goey-toast/styles.css";
import "./approve-post.css";
import "../admin-dashboard.css";

import { api } from "../../lib/api-client";

type PostStatus = "pending" | "approved" | "rejected";

type PendingPost = {
  id: string;
  date: string;
  title: string;
  summary: string;
  author: string;
  organization: string;
  category: string;
};

type PostModerationState = {
  status: PostStatus;
  feedback: string;
};

<<<<<<< HEAD
=======
const pendingPosts: PendingPost[] = [
  {
    id: "post-1",
    date: "February 20, 2026",
    title: "Innovative Approaches to Online Graduate Education",
    summary:
      "A peer-reviewed study examining mentorship challenges faced by graduate students and proposing institutional support frameworks for online thesis advising. This includes a 5-year longitudinal dataset.",
    author: "Dr. Elena Rodriguez",
    organization: "Northern Luzon Graduate Consortium",
    category: "Article",
  },
  {
    id: "post-2",
    date: "March 3, 2026",
    title: "Assessment Framework for Hybrid Capstone Programs",
    summary:
      "This submission proposes a rubric-driven framework for evaluating hybrid capstone projects with emphasis on outcomes, stakeholder feedback, and program alignment.",
    author: "Prof. Marianne Dela Cruz",
    organization: "Metro Academic Alliance",
    category: "Research",
  },
  {
    id: "post-3",
    date: "March 12, 2026",
    title: "Graduate Student Well-Being in High-Load Semesters",
    summary:
      "An evidence-based report on advising load, burnout signals, and intervention checkpoints that can be integrated into graduate student support offices.",
    author: "Dr. Jose Miguel Santos",
    organization: "Visayas University Network",
    category: "Journal",
  },
  {
    id: "post-4",
    date: "March 18, 2026",
    title: "AI-Assisted Literature Mapping for Thesis Writing",
    summary:
      "Explores guided AI workflows for early-stage literature mapping while preserving citation integrity, research ethics, and faculty supervision standards.",
    author: "Dr. Angela Reyes",
    organization: "Mindanao Scholars Association",
    category: "Article",
  },
  {
    id: "post-5",
    date: "March 22, 2026",
    title: "Methodological Shifts in Post-Pandemic Research",
    summary:
      "Analyzes the transition from traditional field gathering to remote data collection methodologies in the social sciences.",
    author: "Dr. Francis Buena",
    organization: "Southern Research Institute",
    category: "Research",
  }
];

>>>>>>> dev
export default function ApprovePostPage() {
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [postStateById, setPostStateById] = useState<Record<string, PostModerationState>>({});
  const [selectedPostId, setSelectedPostId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [feedbackInput, setFeedbackInput] = useState("");
<<<<<<< HEAD
  const [feedbackError, setFeedbackError] = useState("");
  const [lastNotification, setLastNotification] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
=======
>>>>>>> dev
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // 4 items per page

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get('/posts?status=pending');
        const postsList: PendingPost[] = response.posts.map((post: any) => {
          const cat = post.category || "general";
          return {
            id: post.id.toString(),
            date: new Date(post.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }),
            title: post.title,
            summary: post.excerpt || "No summary provided.",
            author: post.author || "Institutional Writer",
            organization: post.user?.university || "Graduate Council Affiliate",
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
          };
        });
        
        setPendingPosts(postsList);
        
        const initialStates: Record<string, PostModerationState> = {};
        postsList.forEach((post) => {
          initialStates[post.id] = { status: "pending", feedback: "" };
        });
        setPostStateById(initialStates);

        if (postsList.length > 0) {
          setSelectedPostId(postsList[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch pending moderation posts", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, []);

  const filteredPosts = useMemo(
    () =>
      pendingPosts.filter((post) => {
        const status = postStateById[post.id]?.status ?? "pending";
        const categoryMatch = categoryFilter === "all" || post.category.toLowerCase() === categoryFilter;
        const statusMatch = statusFilter === "all" || status === statusFilter;
        return categoryMatch && statusMatch;
      }),
    [categoryFilter, pendingPosts, postStateById, statusFilter],
  );

  const selectedPost = useMemo(
    () => filteredPosts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null,
    [filteredPosts, selectedPostId],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    pendingPosts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [pendingPosts]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));

  const pagedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [currentPage, filteredPosts, pageSize]);

  // Logic to limit pagination to exactly 4 visible buttons
  const visiblePages = useMemo(() => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 3);
    
    if (end - start < 3) {
      start = Math.max(1, end - 3);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectedPost) {
      setFeedbackInput("");
      return;
    }
    setFeedbackInput(postStateById[selectedPost.id]?.feedback ?? "");
  }, [postStateById, selectedPost]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    setFeedbackInput(postStateById[postId]?.feedback ?? "");
<<<<<<< HEAD
    setFeedbackError("");
  };

  const handleModeratePost = async (postId: string, status: PostStatus) => {
    const post = pendingPosts.find((item) => item.id === postId);
    if (!post || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackError("");
    setLastNotification("");
    try {
      if (status === "approved") {
        await api.post(`/posts/${postId}/approve`, {});
        setLastNotification(
          `Success: "${post.title}" has been approved and published.`
        );
      } else {
        await api.post(`/posts/${postId}/reject`, { feedback: "Rejected via quick action." });
        setLastNotification(
          `Returned to organization: "${post.title}" rejected.`
        );
      }

      setPostStateById((current) => ({
        ...current,
        [postId]: {
          status,
          feedback: status === "rejected" ? "Rejected via quick action." : "",
        },
      }));

      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      setFeedbackError(err.message || `Failed to ${status} post.`);
    } finally {
      setIsSubmitting(false);
    }
=======
  };

  const handleApprove = () => {
    if (!selectedPost) return;

    setPostStateById((current) => ({
      ...current,
      [selectedPost.id]: {
        ...current[selectedPost.id],
        status: "approved",
      },
    }));

    gooeyToast.success(`"${selectedPost.title}" approved successfully.`);
>>>>>>> dev
  };

  const handleApprove = async () => {
    if (!selectedPost || isSubmitting) return;
    setIsSubmitting(true);
    setFeedbackError("");
    setLastNotification("");
    try {
      await api.post(`/posts/${selectedPost.id}/approve`, {});
      
      setPostStateById((current) => ({
        ...current,
        [selectedPost.id]: {
          ...current[selectedPost.id],
          status: "approved",
        },
      }));

      setLastNotification(
        `Success: "${selectedPost.title}" has been approved and published.`
      );
      
      setPendingPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to approve post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost || isSubmitting) return;

    const trimmedFeedback = feedbackInput.trim();
    if (!trimmedFeedback) {
      gooeyToast.error("Rejection feedback is required.");
      return;
    }

<<<<<<< HEAD
    setIsSubmitting(true);
    setFeedbackError("");
    setLastNotification("");
    try {
      await api.post(`/posts/${selectedPost.id}/reject`, { feedback: trimmedFeedback });

      setPostStateById((current) => ({
        ...current,
        [selectedPost.id]: {
          status: "rejected",
          feedback: trimmedFeedback,
        },
      }));

      setLastNotification(
        `Returned to organization: "${selectedPost.title}" rejected with feedback.`
      );

      setPendingPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to reject post.");
    } finally {
      setIsSubmitting(false);
    }
=======
    setPostStateById((current) => ({
      ...current,
      [selectedPost.id]: {
        status: "rejected",
        feedback: trimmedFeedback,
      },
    }));

    gooeyToast.success(`Post rejected. Feedback sent to ${selectedPost.organization}.`);
>>>>>>> dev
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="approve-page"
        mainClassName="approve-main"
        title="Post Approval"
        subtitle="Review and approve posts submitted by the Post Reviewer (Organization Panel)."
        eyebrow="Admin Panel"
      >
        <section className="approve-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ color: '#1e538e', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>Processing Submissions...</p>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>Syncing with Supabase DB</p>
          </div>
        </section>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout
      pageClassName="approve-page"
      mainClassName="approve-main"
      title="Post Approval"
      subtitle="Review and moderate academic submissions prior to publication."
      eyebrow="Editorial Dashboard"
    >
<<<<<<< HEAD
      <section className="approve-content" style={{ opacity: isSubmitting ? 0.7 : 1, pointerEvents: isSubmitting ? 'none' : 'auto', transition: 'opacity 0.2s ease' }}>
        <div className="approve-hero">
          <div className="approve-hero__inner">
            <div className="approve-hero__controls" role="region" aria-label="Approval filters">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="All Categories"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
=======
      <section className="approve-content">
        
        {/* Minimal Academic Toolbar */}
        <div className="approve-toolbar">
          <div className="approve-toolbar__left">
            <span className="approve-toolbar__count">
              Showing <strong>{filteredPosts.length}</strong> submission{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>
>>>>>>> dev

          <div className="approve-toolbar__filters" role="region" aria-label="Approval filters">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
              className="approve-select"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PostStatus | "all")}
              aria-label="Filter by Status"
              className="approve-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <section className="approve-layout">
          
          {/* Master List (Research Inbox Style) */}
          <section className="approve-list" aria-label="Pending post list">
            {pagedPosts.map((post) => (
              <article
                key={post.id}
                role="button"
                tabIndex={0}
                className={`approve-card ${selectedPost?.id === post.id ? "approve-card--active" : ""}`}
                onClick={() => handleSelectPost(post.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectPost(post.id);
                  }
                }}
              >
                <div className="approve-card__header">
                  <span className="approve-card__category">{post.category}</span>
                  <span className={`approve-status-dot approve-status-dot--${postStateById[post.id]?.status ?? "pending"}`} title={postStateById[post.id]?.status}>
                    {(postStateById[post.id]?.status ?? "pending").toUpperCase()}
                  </span>
                </div>

                <h2>{post.title}</h2>
<<<<<<< HEAD
                <div className="approve-card__actions" aria-label={`Quick actions for ${post.title}`}>
                  <button
                    type="button"
                    className="approve-card__action approve-card__action--accept"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleModeratePost(post.id, "approved");
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="approve-card__action approve-card__action--reject"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleModeratePost(post.id, "rejected");
                    }}
                  >
                    Reject
                  </button>
=======
                <p className="approve-card__summary">{post.summary}</p>
                
                <div className="approve-card__footer">
                  <div className="approve-card__meta">
                    <UserRound size={13} />
                    <span>{post.author}</span>
                    <span className="approve-card__divider">•</span>
                    <CalendarDays size={13} />
                    <span>{post.date}</span>
                  </div>
>>>>>>> dev
                </div>
              </article>
            ))}

            {filteredPosts.length === 0 && (
              <div className="approve-empty-state">
                <BookOpen size={32} className="approve-empty-icon" />
                <p>No submissions found in this queue.</p>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <nav className="approve-pagination" aria-label="Approve post pagination">
                <button
                  type="button"
                  className="approve-pagination__nav"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1 || isSubmitting}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="approve-pagination__pages">
<<<<<<< HEAD
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`approve-pagination__page${page === currentPage ? " approve-pagination__page--active" : ""}`}
                        disabled={isSubmitting}
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
=======
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`approve-pagination__page ${page === currentPage ? "approve-pagination__page--active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
>>>>>>> dev
                </div>

                <button
                  type="button"
                  className="approve-pagination__nav"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages || isSubmitting}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </section>

          {/* Detail Panel (Manuscript Review Style) */}
          <aside className="approve-detail">
            <div className="approve-detail__inner">
              <div className="approve-detail__header">
                <h3>Manuscript Details</h3>
                {selectedPost && (
                  <span className={`approve-status-badge approve-status-badge--${postStateById[selectedPost.id]?.status ?? "pending"}`}>
                    {(postStateById[selectedPost.id]?.status ?? "pending").toUpperCase()}
                  </span>
                )}
              </div>

              {!selectedPost && (
                <div className="approve-empty-text">
                  Select a manuscript from the queue to review and moderate.
                </div>
              )}

<<<<<<< HEAD
            {selectedPost && (
              <>
                <div className="approve-detail__block">
                  <p className="approve-detail__label">Title</p>
                  <p>{selectedPost?.title}</p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Category</p>
                  <p>{selectedPost?.category}</p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Submitted by</p>
                  <p>{selectedPost?.author}</p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Date</p>
                  <p>{selectedPost?.date}</p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Organization</p>
                  <p>{selectedPost?.organization}</p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Current Status</p>
                  <p className={`approve-status approve-status--${postStateById[selectedPost.id]?.status ?? "pending"}`}>
                    {(postStateById[selectedPost.id]?.status ?? "pending").toUpperCase()}
                  </p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Excerpt</p>
                  <p>{selectedPost?.summary}</p>
                </div>

                <div className="approve-detail__block">
                  <p className="approve-detail__label">Rejection Feedback</p>
                  <textarea
                    className="approve-feedback"
                    placeholder="Enter feedback to organization for rejected posts"
                    value={feedbackInput}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setFeedbackInput(event.target.value);
                      if (feedbackError) setFeedbackError("");
                    }}
                    rows={4}
                  />
                  {feedbackError && <p className="approve-error">{feedbackError}</p>}
                  {postStateById[selectedPost.id]?.feedback && (
                    <p className="approve-saved-feedback">
                      Saved feedback: {postStateById[selectedPost.id].feedback}
                    </p>
                  )}
                </div>

                <div className="approve-detail__actions">
                  <button type="button" className="approve-btn approve-btn--accept" disabled={isSubmitting} onClick={handleApprove}>
                    {isSubmitting ? "Approving..." : "Approve"}
                  </button>
                  <button type="button" className="approve-btn approve-btn--reject" disabled={isSubmitting} onClick={handleReject}>
                    {isSubmitting ? "Rejecting..." : "Reject"}
                  </button>
                </div>

                {lastNotification && <p className="approve-notification">{lastNotification}</p>}
              </>
            )}
=======
              {selectedPost && (
                <div className="approve-detail__body">
                  <div className="approve-detail__block">
                    <p className="approve-detail__label">Title</p>
                    <p className="approve-detail__title-value">{selectedPost.title}</p>
                  </div>

                  <div className="approve-detail__row">
                    <div className="approve-detail__block">
                      <p className="approve-detail__label">Category</p>
                      <p className="approve-detail__value capitalize">{selectedPost.category}</p>
                    </div>
                    <div className="approve-detail__block">
                      <p className="approve-detail__label">Submission Date</p>
                      <p className="approve-detail__value">{selectedPost.date}</p>
                    </div>
                  </div>

                  <div className="approve-detail__row">
                    <div className="approve-detail__block">
                      <p className="approve-detail__label">Primary Author</p>
                      <p className="approve-detail__value">{selectedPost.author}</p>
                    </div>
                    <div className="approve-detail__block">
                      <p className="approve-detail__label">Institution / Organization</p>
                      <p className="approve-detail__value">{selectedPost.organization}</p>
                    </div>
                  </div>

                  <div className="approve-detail__block">
                    <p className="approve-detail__label">Abstract</p>
                    <p className="approve-detail__abstract">
                      {selectedPost.summary}
                    </p>
                  </div>

                  <div className="approve-detail__block approve-detail__feedback-block">
                    <p className="approve-detail__label">Editorial Feedback <span className="approve-required">*</span></p>
                    <textarea
                      className="approve-feedback"
                      placeholder="Required if rejecting. Provide actionable feedback to the author/institution."
                      value={feedbackInput}
                      onChange={(event) => setFeedbackInput(event.target.value)}
                      rows={4}
                    />
                    {postStateById[selectedPost.id]?.feedback && (
                      <div className="approve-saved-feedback">
                        <strong>Previous Feedback:</strong> {postStateById[selectedPost.id].feedback}
                      </div>
                    )}
                  </div>

                  <div className="approve-detail__actions">
                    <button type="button" className="approve-btn approve-btn--accept" onClick={handleApprove}>
                      <Check size={16} /> Approve Manuscript
                    </button>
                    <button type="button" className="approve-btn approve-btn--reject" onClick={handleReject}>
                      Request Revisions (Reject)
                    </button>
                  </div>
                </div>
              )}
            </div>
>>>>>>> dev
          </aside>
        </section>
      </section>
    </AdminSidebarLayout>
  );
}