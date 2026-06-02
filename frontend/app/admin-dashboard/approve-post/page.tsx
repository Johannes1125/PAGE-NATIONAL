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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    pendingPosts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [pendingPosts]);

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

  const handleModeratePost = async (postId: string, status: PostStatus) => {
    const post = pendingPosts.find((item) => item.id === postId);
    if (!post) return;

    setIsLoading(true);
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
      setIsLoading(false);
    }
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
                  <p>{selectedPost?.summary}</p>
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
