"use client";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  Paperclip,
  Search,
  SendHorizontal,
  Smile,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api-client";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import "./view-messages.css";
import "../admin-dashboard.css";

type MessageRole = "admin" | "other";

type ChatMessage = {
  id: string;
  subject: string;
  role: MessageRole;
  text: string;
  dateLabel: string;
  status: "unread" | "read" | "sent" | "seen";
  attachments: string[];
};

type ConversationTag = "admin" | "organization" | "users";

type Conversation = {
  id: string;
  name: string;
  online: boolean;
  avatarText: string;
  tag: ConversationTag;
  messages: ChatMessage[];
};

const tagList: { id: ConversationTag; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "organization", label: "Organization" },
  { id: "users", label: "Users" },
];

const conversations: Conversation[] = [
  {
    id: "system-admin",
    name: "System Admin",
    online: true,
    avatarText: "SA",
    tag: "admin",
    messages: [
      {
        id: "m-1",
        subject: "Communication Policy",
        role: "other",
        text: "Strict communication protocol. Professional inquiries only. Messages are archived for 90 days.",
        dateLabel: "10:20 AM",
        status: "unread",
        attachments: [],
      },
      {
        id: "m-2",
        subject: "Quarterly Review Files",
        role: "other",
        text: "Hello Maria, the quarterly review documents have been uploaded to the shared folder. Could you please verify the totals for Section 4?",
        dateLabel: "10:21 AM",
        status: "unread",
        attachments: ["Q1-review-summary.pdf"],
      },
      {
        id: "m-3",
        subject: "Re: Quarterly Review Files",
        role: "admin",
        text: "I look into it right away, Admin. I should have the verification completed within the next hour.",
        dateLabel: "10:23 AM",
        status: "seen",
        attachments: [],
      },
      {
        id: "m-4",
        subject: "Missing Regional Entries",
        role: "other",
        text: "Please check the monthly report file as well, it seems some entries are missing for the Western region.",
        dateLabel: "10:24 AM",
        status: "unread",
        attachments: ["monthly-report-western.xlsx"],
      },
    ],
  },
  {
    id: "david-miller",
    name: "David Miller",
    online: false,
    avatarText: "DM",
    tag: "organization",
    messages: [
      {
        id: "m-5",
        subject: "Document Submission",
        role: "other",
        text: "I sent the documents by EOD.",
        dateLabel: "Yesterday",
        status: "read",
        attachments: ["submission-proof.pdf"],
      },
      {
        id: "m-6",
        subject: "Re: Document Submission",
        role: "admin",
        text: "Received. Thank you, David.",
        dateLabel: "Yesterday",
        status: "seen",
        attachments: [],
      },
    ],
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    online: false,
    avatarText: "SJ",
    tag: "users",
    messages: [
      {
        id: "m-7",
        subject: "Event Update",
        role: "other",
        text: "The event was a great success!",
        dateLabel: "Tuesday",
        status: "read",
        attachments: [],
      },
      {
        id: "m-8",
        subject: "Re: Event Update",
        role: "admin",
        text: "Great to hear. Please share highlights when available.",
        dateLabel: "Tuesday",
        status: "seen",
        attachments: [],
      },
    ],
  },
];

/** Compact status indicator: icon-only instead of long status sentences. */
function StatusIndicator({ role, status }: { role: MessageRole; status: ChatMessage["status"] }) {
  if (role === "admin") {
    return (
      <span className="message-bubble__status" title={status === "seen" ? "Seen" : "Sent"}>
        {status === "seen" ? <CheckCheck size={12} /> : <Check size={12} />}
      </span>
    );
  }
  if (status === "unread") {
    return <span className="message-bubble__status message-bubble__status--dot" title="Unread" />;
  }
  return null;
}

export default function ViewMessagesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [conversationState, setConversationState] = useState<Conversation[]>([]);
  const [activeTag, setActiveTag] = useState<ConversationTag>("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftSubject, setDraftSubject] = useState("Re: Follow-up");
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [notification, setNotification] = useState("");
  // Controls which pane is visible on narrow / mobile viewports.
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Load threads on mount or tag change
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get('/messages');
        const mappedThreads: Conversation[] = response.threads.map((t: any) => ({
          id: t.conversationId,
          name: t.name,
          online: t.role === 'admin' || t.role === 'organization',
          avatarText: t.name ? t.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U",
          tag: t.tag as ConversationTag,
          messages: [{
            id: 'last-' + t.conversationId,
            subject: t.subject,
            role: t.role === 'admin' ? 'admin' : 'other',
            text: t.lastMessage,
            dateLabel: t.timestamp,
            status: t.unread ? 'unread' : 'read',
            attachments: []
          }]
        }));
        setConversationState(mappedThreads);
        if (mappedThreads.length > 0 && !activeConversationId) {
          const firstOfTag = mappedThreads.find(t => t.tag === activeTag);
          setActiveConversationId(firstOfTag ? firstOfTag.id : mappedThreads[0].id);
        }
      } catch (err) {
        console.error("Failed to load threads", err);
      }
    };
    fetchThreads();
  }, [activeTag]);

  // Load message history when selecting conversation
  const fetchMessagesForThread = async (id: string) => {
    try {
      const response = await api.get(`/messages/${id}`);
      const mappedMsgs: ChatMessage[] = response.messages.map((m: any) => ({
        id: m.id.toString(),
        subject: m.subject || "Message Inquiry",
        role: m.senderRole === 'admin' ? 'admin' : 'other',
        text: m.text,
        dateLabel: m.timestamp,
        status: m.status === 'read' ? 'read' : (m.status === 'sent' ? 'unread' : m.status),
        attachments: m.attachments ? m.attachments.map((a: any) => a.fileName) : [],
      }));

      setConversationState(current =>
        current.map(c => c.id === id ? { ...c, messages: mappedMsgs } : c)
      );
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      fetchMessagesForThread(activeConversationId);
    }
  }, [activeConversationId]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return conversationState.filter((conversation) => {
      const latestMessage = conversation.messages[conversation.messages.length - 1];
      const matchesTag = conversation.tag === activeTag;
      const matchesSearch =
        query.length === 0 ||
        conversation.name.toLowerCase().includes(query) ||
        latestMessage?.subject.toLowerCase().includes(query) ||
        latestMessage?.text.toLowerCase().includes(query);
      return matchesTag && matchesSearch;
    });
  }, [activeTag, conversationState, searchQuery]);

  const activeConversation =
    filteredConversations.find((conversation) => conversation.id === activeConversationId) ?? filteredConversations[0] ?? null;

  const selectedMessage = activeConversation?.messages.find((message) => message.id === selectedMessageId) ?? null;

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId((current) => (current === messageId ? "" : messageId));
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setSelectedMessageId("");
    setMobileShowChat(true);

    // Mark incoming messages as read when the admin opens the thread.
    setConversationState((current) =>
      current.map((conversation) =>
        conversation.id !== conversationId
          ? conversation
          : {
              ...conversation,
              messages: conversation.messages.map((message) =>
                message.role === "other" && message.status === "unread" ? { ...message, status: "read" as const } : message,
              ),
            },
      ),
    );
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  const handlePickAttachments = () => {
    fileInputRef.current?.click();
  };

  const handleSendReply = async () => {
    if (!activeConversation) return;
    const body = draftMessage.trim();
    const subject = draftSubject.trim() || "Re: Message";
    if (!body) return;

    try {
      const res = await api.post('/messages', {
        conversation_id: activeConversation.id,
        text: body,
        subject: subject,
      });

      if (res.success && res.formatted) {
        const sentMessage: ChatMessage = {
          id: res.formatted.id.toString(),
          subject: res.formatted.subject || subject,
          role: "admin",
          text: res.formatted.text,
          dateLabel: res.formatted.timestamp,
          status: "sent",
          attachments: selectedAttachments,
        };

        setConversationState((current) =>
          current.map((conversation) =>
            conversation.id === activeConversation.id
              ? {
                  ...conversation,
                  messages: [...conversation.messages, sentMessage],
                }
              : conversation,
          ),
        );

        setDraftMessage("");
        setSelectedAttachments([]);
        setNotification(`Reply sent to ${activeConversation.name}.`);
      }
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  return (
    <AdminSidebarLayout
      pageClassName="messages-page"
      mainClassName="messages-main"
      title="Messages"
      subtitle="Communicate with the Admin and respond to general user inquiries."
    >
      <section className="admin-shell admin-shell--main">
        <section className={`messages-panel${mobileShowChat ? " messages-panel--chat-active" : ""}`}>
          <aside className="messages-list-panel">
            <label className="messages-search" aria-label="Search conversations">
              <Search size={13} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="messages-tag-row">
              {tagList.map((tag) => {
                const tagUnread = conversationState
                  .filter((c) => c.tag === tag.id)
                  .reduce(
                    (sum, c) => sum + c.messages.filter((m) => m.role === "other" && m.status === "unread").length,
                    0,
                  );
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`messages-tag${activeTag === tag.id ? " messages-tag--active" : ""}`}
                    onClick={() => setActiveTag(tag.id)}
                  >
                    {tag.label}
                    {tagUnread > 0 && <span className="messages-tag__count">{tagUnread}</span>}
                  </button>
                );
              })}
            </div>

            <div className="messages-conversation-list">
              {filteredConversations.map((conversation) => {
                const latestMessage = conversation.messages[conversation.messages.length - 1];
                const unreadCount = conversation.messages.filter(
                  (message) => message.role === "other" && message.status === "unread",
                ).length;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`messages-conversation${activeConversation?.id === conversation.id ? " messages-conversation--active" : ""}${unreadCount > 0 ? " messages-conversation--unread" : ""}`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <span className="messages-conversation__avatar-wrap">
                      <span className="messages-conversation__avatar">{conversation.avatarText}</span>
                      {conversation.online && <span className="messages-conversation__online-dot" />}
                    </span>
                    <div className="messages-conversation__meta">
                      <div className="messages-conversation__top">
                        <p title={conversation.name}>{conversation.name}</p>
                        <span>{latestMessage?.dateLabel ?? ""}</span>
                      </div>
                      <p className="messages-conversation__subject" title={latestMessage?.subject ?? ""}>{latestMessage?.subject ?? ""}</p>
                      <p className="messages-conversation__preview" title={latestMessage?.text ?? ""}>{latestMessage?.text ?? ""}</p>
                    </div>
                    {unreadCount > 0 && <span className="messages-conversation__unread">{unreadCount}</span>}
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <p className="messages-empty">No conversations match this filter.</p>
              )}
            </div>
          </aside>

          <section className="messages-chat-panel" aria-label="Conversation thread">
            {!activeConversation && <p className="messages-empty">Select a conversation to view messages.</p>}

            {activeConversation && (
              <>
                <header className="messages-chat-header">
                  <div className="messages-chat-header__identity">
                    <button
                      type="button"
                      className="messages-back-btn"
                      aria-label="Back to conversation list"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="messages-conversation__avatar-wrap">
                      <span className="messages-chat-header__avatar">{activeConversation.avatarText}</span>
                      {activeConversation.online && <span className="messages-conversation__online-dot" />}
                    </span>
                    <div>
                      <p className="messages-chat-header__name">{activeConversation.name}</p>
                      <p className="messages-chat-header__status">
                        {activeConversation.online ? "Online" : "Last seen recently"}
                      </p>
                    </div>
                  </div>
                </header>

                {notification && <p className="messages-notification">{notification}</p>}

                <div className="messages-thread">
                  {activeConversation.messages.map((message) => (
                    <article
                      key={message.id}
                      className={`message-bubble ${message.role === "admin" ? "message-bubble--admin" : "message-bubble--other"}${selectedMessageId === message.id ? " message-bubble--selected" : ""}`}
                      onClick={() => handleSelectMessage(message.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") handleSelectMessage(message.id);
                      }}
                    >
                      <p className="message-bubble__subject">{message.subject}</p>
                      <p>{message.text}</p>
                      {message.attachments.length > 0 && (
                        <span className="message-bubble__files">
                          <Paperclip size={10} /> {message.attachments.join(", ")}
                        </span>
                      )}
                      <div className="message-bubble__footer">
                        <span className="message-bubble__time">{message.dateLabel}</span>
                        <StatusIndicator role={message.role} status={message.status} />
                      </div>
                    </article>
                  ))}
                </div>

                {selectedMessage && (
                  <section className="messages-detail">
                    <p><strong>Full Subject:</strong> {selectedMessage.subject}</p>
                    <p><strong>Full Message:</strong> {selectedMessage.text}</p>
                    <p><strong>Date:</strong> {selectedMessage.dateLabel}</p>
                  </section>
                )}

                <footer className="messages-composer">
                  <button type="button" className="messages-icon-btn" aria-label="Attach file" onClick={handlePickAttachments}>
                    <Paperclip size={14} />
                  </button>
                  <div className="messages-compose-fields">
                    <input
                      type="text"
                      className="messages-compose-fields__subject"
                      placeholder="Subject"
                      value={draftSubject}
                      onChange={(event) => setDraftSubject(event.target.value)}
                    />
                    <input
                      type="text"
                      className="messages-compose-fields__body"
                      placeholder="Type your message..."
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleSendReply();
                      }}
                    />
                    {selectedAttachments.length > 0 && (
                      <p className="messages-attachment-list">
                        {selectedAttachments.join(", ")}
                      </p>
                    )}
                  </div>
                  <button type="button" className="messages-icon-btn" aria-label="Open emoji list">
                    <Smile size={14} />
                  </button>
                  <button type="button" className="messages-send-btn" aria-label="Send message" onClick={handleSendReply}>
                    <SendHorizontal size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="messages-hidden-input"
                    onChange={(event) => {
                      const names = Array.from(event.target.files ?? []).map((file) => file.name);
                      setSelectedAttachments(names);
                    }}
                  />
                </footer>
              </>
            )}
          </section>
        </section>
      </section>
    </AdminSidebarLayout>
  );
}