"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, UserRound } from "lucide-react";
import AdminNotifications from "../components/AdminNotifications";
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

  useEffect(() => {
    if (!selectedPost) {
      setFeedbackInput("");
      return;
    }

    setFeedbackInput(postStateById[selectedPost.id]?.feedback ?? "");
  }, [postStateById, selectedPost]);

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    setFeedbackInput(postStateById[postId]?.feedback ?? "");
    setFeedbackError("");
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
    <main className="approve-page">
      <aside className="admin-navbar">
        <div className="admin-navbar__inner">
          <div className="admin-brand">
            <div className="admin-brand__badge" aria-hidden="true">P</div>
            <div className="admin-brand__identity">
              <div className="admin-brand__eyebrow">PAGE</div>
              <div className="admin-brand__name">Admin Dashboard</div>
              <div className="admin-brand__tagline">Philippine Association for Graduate Education</div>
            </div>
          </div>

          <nav className="admin-nav">
            <Link href="/" className="admin-nav__link">Main Page</Link>
            <Link href="/admin-dashboard" className="admin-nav__link">Overview</Link>
            <Link href="/admin-dashboard/create-new-post" className="admin-nav__link">Create New Post</Link>
            <Link href="/admin-dashboard/approve-post" className="admin-nav__link admin-nav__link--active">Approve Posts</Link>
            <Link href="/admin-dashboard/manage-users" className="admin-nav__link">Manage Users</Link>
            <Link href="/admin-dashboard/view-messages" className="admin-nav__link">Messages</Link>
          </nav>
        </div>
      </aside>

      <section className="approve-main">
        <header className="admin-header">
          <div className="admin-header__bar">
            <div className="admin-header__brand">
              <div className="admin-header__brand-mark" aria-hidden="true">
                <span className="admin-header__brand-mark-text">P</span>
              </div>
              <div className="admin-header__brand-copy">
                <span className="admin-header__brand-name">PAGE</span>
                <span className="admin-header__brand-subtitle">Admin Dashboard</span>
              </div>
            </div>

            <div className="admin-header__actions">
              <AdminNotifications compact />

              <div className="admin-profile">
                <div className="admin-profile__avatar" aria-hidden="true">JD</div>
                <div className="admin-profile__copy">
                  <span className="admin-profile__name">Dr. Juan Dela Cruz</span>
                  <span className="admin-profile__role">Admin Panel</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-shell admin-shell--intro">
          <p className="admin-header__eyebrow">Admin Panel</p>
          <h1 className="admin-header__title">Post Approval</h1>
          <p className="admin-header__subtitle">Review and approve posts submitted by the Post Reviewer (Organization Panel).</p>

          <div className="approve-hero__controls" style={{ marginTop: 10 }}>
            <select
              value={categoryFilter}
              aria-label="Category filter"
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="article">Article</option>
              <option value="research">Research</option>
              <option value="journal">Journal</option>
            </select>

            <select
              value={statusFilter}
              aria-label="Status filter"
              onChange={(event) => setStatusFilter(event.target.value as PostStatus | "all")}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </section>

        <section className="approve-content">
          <section className="approve-layout">
            <section className="approve-list" aria-label="Pending post list">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className={`approve-card${selectedPost?.id === post.id ? " approve-card--active" : ""}`}
                  onClick={() => handleSelectPost(post.id)}
                >
                  <div className="approve-card__date">
                    <CalendarDays size={12} />
                    <span>{post.date}</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.summary}</p>
                  <div className="approve-card__meta">
                    <UserRound size={12} />
                    <span>{post.author} • {post.organization}</span>
                  </div>
                  <span className={`approve-status-badge approve-status-badge--${postStateById[post.id]?.status ?? "pending"}`}>
                    {(postStateById[post.id]?.status ?? "pending").toUpperCase()}
                  </span>
                </button>
              ))}

              {filteredPosts.length === 0 && <p className="approve-empty">No posts match the selected filters.</p>}
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
      </section>
    </main>
  );
}
