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
    <AdminSidebarLayout
      pageClassName="approve-page"
      mainClassName="approve-main"
      title="Post Approval"
      subtitle="Review and approve posts submitted by the Post Reviewer (Organization Panel)."
      eyebrow="Admin Panel"
    >
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
    </AdminSidebarLayout>
  );
}
