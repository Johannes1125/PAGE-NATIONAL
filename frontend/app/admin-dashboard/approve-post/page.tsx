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

export default function ApprovePostPage() {
  const initialPostState = useMemo<Record<string, PostModerationState>>(
    () => Object.fromEntries(pendingPosts.map((post) => [post.id, { status: "pending", feedback: "" }])),
    [],
  );

  const [postStateById, setPostStateById] = useState<Record<string, PostModerationState>>(initialPostState);
  const [selectedPostId, setSelectedPostId] = useState(pendingPosts[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // 4 items per page

  const filteredPosts = useMemo(
    () =>
      pendingPosts.filter((post) => {
        const status = postStateById[post.id]?.status ?? "pending";
        const categoryMatch = categoryFilter === "all" || post.category.toLowerCase() === categoryFilter;
        const statusMatch = statusFilter === "all" || status === statusFilter;
        return categoryMatch && statusMatch;
      }),
    [categoryFilter, postStateById, statusFilter],
  );

  const selectedPost = useMemo(
    () => filteredPosts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null,
    [filteredPosts, selectedPostId],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    pendingPosts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));

  const pagedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [currentPage, filteredPosts]);

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
  };

  const handleReject = () => {
    if (!selectedPost) return;

    const trimmedFeedback = feedbackInput.trim();
    if (!trimmedFeedback) {
      gooeyToast.error("Rejection feedback is required.");
      return;
    }

    setPostStateById((current) => ({
      ...current,
      [selectedPost.id]: {
        status: "rejected",
        feedback: trimmedFeedback,
      },
    }));

    gooeyToast.success(`Post rejected. Feedback sent to ${selectedPost.organization}.`);
  };

  return (
    <AdminSidebarLayout
      pageClassName="approve-page"
      mainClassName="approve-main"
      title="Post Approval"
      subtitle="Review and moderate academic submissions prior to publication."
      eyebrow="Editorial Dashboard"
    >
      <section className="approve-content">
        
        {/* Minimal Academic Toolbar */}
        <div className="approve-toolbar">
          <div className="approve-toolbar__left">
            <span className="approve-toolbar__count">
              Showing <strong>{filteredPosts.length}</strong> submission{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

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
                <p className="approve-card__summary">{post.summary}</p>
                
                <div className="approve-card__footer">
                  <div className="approve-card__meta">
                    <UserRound size={13} />
                    <span>{post.author}</span>
                    <span className="approve-card__divider">•</span>
                    <CalendarDays size={13} />
                    <span>{post.date}</span>
                  </div>
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
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="approve-pagination__pages">
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
                </div>

                <button
                  type="button"
                  className="approve-pagination__nav"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
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
          </aside>
        </section>
      </section>
    </AdminSidebarLayout>
  );
}