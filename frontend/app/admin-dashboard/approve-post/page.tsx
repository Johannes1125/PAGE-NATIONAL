"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileClock,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
  PlusCircle,
  UserRound,
  Users,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
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
      "A peer-reviewed study examining mentorship challenges faced by graduate students and proposing institutional support frameworks for online thesis advising.",
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
  const [feedbackError, setFeedbackError] = useState("");
  const [lastNotification, setLastNotification] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

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
    setFeedbackError("");
  };

  const handleModeratePost = (postId: string, status: PostStatus) => {
    const post = pendingPosts.find((item) => item.id === postId);
    if (!post) return;

    setPostStateById((current) => ({
      ...current,
      [postId]: {
        ...current[postId],
        status,
      },
    }));

    setSelectedPostId(postId);
    setLastNotification(
      `Notification sent to ${post.organization}: "${post.title}" has been ${status}.`,
    );
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

    setFeedbackError("");
    setLastNotification(
      `Notification sent to ${selectedPost.organization}: "${selectedPost.title}" has been approved.`,
    );
  };

  const handleReject = () => {
    if (!selectedPost) return;

    const trimmedFeedback = feedbackInput.trim();
    if (!trimmedFeedback) {
      setFeedbackError("Rejection feedback is required.");
      return;
    }

    setPostStateById((current) => ({
      ...current,
      [selectedPost.id]: {
        status: "rejected",
        feedback: trimmedFeedback,
      },
    }));

    setFeedbackError("");
    setLastNotification(
      `Notification sent to ${selectedPost.organization}: "${selectedPost.title}" was rejected with admin feedback.`,
    );
  };

  return (
    <AdminSidebarLayout
      pageClassName="approve-page"
      mainClassName="approve-main"
      title="Post Approval"
      subtitle="Review and approve posts submitted by the Post Reviewer (Organization Panel)."
      eyebrow="Admin Panel"
    >
      <section className="approve-content">
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PostStatus | "all")}
                aria-label="Status"
              >
                <option value="all">Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <section className="approve-layout">
          <section className="approve-list" aria-label="Pending post list">
            {pagedPosts.map((post) => (
              <article
                key={post.id}
                role="button"
                tabIndex={0}
                className={`approve-card${selectedPost?.id === post.id ? " approve-card--active" : ""}`}
                onClick={() => handleSelectPost(post.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectPost(post.id);
                  }
                }}
              >
                <div className="approve-card__date">
                  <CalendarDays size={12} />
                  <span>{post.date}</span>
                </div>
                <h2>{post.title}</h2>
                <div className="approve-card__actions" aria-label={`Quick actions for ${post.title}`}>
                  <button
                    type="button"
                    className="approve-card__action approve-card__action--accept"
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
                    onClick={(event) => {
                      event.stopPropagation();
                      handleModeratePost(post.id, "rejected");
                    }}
                  >
                    Reject
                  </button>
                </div>
                <p>{post.summary}</p>
                <div className="approve-card__meta">
                  <UserRound size={12} />
                  <span>{post.author} • {post.organization}</span>
                </div>
                <span className={`approve-status-badge approve-status-badge--${postStateById[post.id]?.status ?? "pending"}`}>
                  {(postStateById[post.id]?.status ?? "pending").toUpperCase()}
                </span>
              </article>
            ))}

            {filteredPosts.length === 0 && <p className="approve-empty">No posts match the selected filters.</p>}

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
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`approve-pagination__page${page === currentPage ? " approve-pagination__page--active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
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

          <aside className="approve-detail">
            <h3>Post Details</h3>

            {!selectedPost && (
              <p className="approve-empty">Select a post from the list to review its details.</p>
            )}

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
              <p>
                {selectedPost?.summary}
              </p>
            </div>

            <div className="approve-detail__block">
              <p className="approve-detail__label">Rejection Feedback</p>
              <textarea
                className="approve-feedback"
                placeholder="Enter feedback to organization for rejected posts"
                value={feedbackInput}
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
              <button type="button" className="approve-btn approve-btn--accept" onClick={handleApprove}>
                Approve
              </button>
              <button type="button" className="approve-btn approve-btn--reject" onClick={handleReject}>
                Reject
              </button>
            </div>

            {lastNotification && <p className="approve-notification">{lastNotification}</p>}
              </>
            )}
          </aside>
        </section>
      </section>
    </AdminSidebarLayout>
  );
}
