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

export default function ApprovePostPage() {
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [postStateById, setPostStateById] = useState<Record<string, PostModerationState>>({});
  const [selectedPostId, setSelectedPostId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [lastNotification, setLastNotification] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get('/posts?status=pending');
        const postsList: PendingPost[] = response.posts.map((post: any) => ({
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
          category: post.category.charAt(0).toUpperCase() + post.category.slice(1),
        }));
        
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

  const handleApprove = async () => {
    if (!selectedPost) return;
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost) return;

    const trimmedFeedback = feedbackInput.trim();
    if (!trimmedFeedback) {
      setFeedbackError("Rejection feedback is required.");
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
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
