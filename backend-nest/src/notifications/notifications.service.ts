import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AggregatedNotificationItem {
  id: string;
  type: string;
  sourceId: string;
  title: string;
  body: string;
  source: 'overview' | 'create-post' | 'approve-post' | 'manage-users' | 'messages' | 'applications';
  href: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string; // ISO 8601 String
}

const DEFAULT_FETCH_LIMIT = 50;
const SUBQUERY_TAKE_LIMIT = 20;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates live notification-worthy records across Prisma models,
   * joins persisted read/deleted state overrides, and returns chronologically
   * sorted notifications (newest first).
   */
  async getNotifications(limit: number = DEFAULT_FETCH_LIMIT): Promise<AggregatedNotificationItem[]> {
    const rawItems: AggregatedNotificationItem[] = [];

    // 1. Pending Posts
    try {
      const pendingPosts = await this.prisma.posts.findMany({
        where: { status: 'pending' },
        include: { users: { select: { id: true, name: true, email: true } } },
        orderBy: { created_at: 'desc' },
        take: SUBQUERY_TAKE_LIMIT,
      });

      for (const post of pendingPosts) {
        const postAuthor = post.author || post.users?.name || 'Author';
        const postTitle = post.title.length > 50 ? `${post.title.slice(0, 47)}...` : post.title;
        rawItems.push({
          id: `post_pending:${post.id.toString()}`,
          type: 'post_pending',
          sourceId: post.id.toString(),
          title: `Post Pending Approval: "${postTitle}"`,
          body: `Submitted by ${postAuthor} in ${post.category}. Moderation review required.`,
          source: 'approve-post',
          href: '/admin-dashboard/approve-post',
          isRead: false,
          isDeleted: false,
          createdAt: (post.created_at || new Date()).toISOString(),
        });
      }
    } catch (err) {
      this.logger.error('Error querying pending posts for notifications:', err);
    }

    // 2. Pending Membership Applications
    try {
      const pendingApps = await this.prisma.membershipApplication.findMany({
        where: {
          status: { in: ['submitted', 'under_review', 'draft'] },
        },
        include: {
          applicant: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: SUBQUERY_TAKE_LIMIT,
      });

      for (const app of pendingApps) {
        let applicantName = app.applicant?.name;
        if (!applicantName && app.profileData && typeof app.profileData === 'object') {
          const pd = app.profileData as Record<string, any>;
          applicantName = [pd.firstName, pd.lastName].filter(Boolean).join(' ');
        }
        applicantName = applicantName || 'Applicant';

        const statusLabel =
          app.status === 'submitted'
            ? 'Submitted'
            : app.status === 'under_review'
            ? 'Under Review'
            : 'Draft';

        rawItems.push({
          id: `membership_application:${app.id}`,
          type: 'membership_application',
          sourceId: app.id,
          title: `Membership Application: ${applicantName}`,
          body: `${app.membershipType} membership application (${statusLabel}) awaiting review.`,
          source: 'manage-users',
          href: '/admin-dashboard/membership-applications',
          isRead: false,
          isDeleted: false,
          createdAt: (app.submittedAt || app.createdAt).toISOString(),
        });
      }
    } catch (err) {
      this.logger.error('Error querying membership applications for notifications:', err);
    }

    // 3. Inbound Messages
    try {
      const recentMessages = await this.prisma.messages.findMany({
        where: {
          users_messages_sender_idTousers: {
            role: { not: 'admin' },
          },
        },
        include: {
          users_messages_sender_idTousers: { select: { id: true, name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        take: SUBQUERY_TAKE_LIMIT,
      });

      for (const msg of recentMessages) {
        const senderName = msg.users_messages_sender_idTousers?.name || 'Inquirer';
        const snippet = msg.text.length > 60 ? `${msg.text.slice(0, 57)}...` : msg.text;
        rawItems.push({
          id: `message:${msg.id.toString()}`,
          type: 'message',
          sourceId: msg.id.toString(),
          title: `New Message from ${senderName}`,
          body: `${msg.subject ? `[${msg.subject}] ` : ''}${snippet}`,
          source: 'messages',
          href: '/admin-dashboard/view-messages',
          isRead: false,
          isDeleted: false,
          createdAt: (msg.created_at || new Date()).toISOString(),
        });
      }
    } catch (err) {
      this.logger.error('Error querying messages for notifications:', err);
    }

    // 4. Pending Article Submissions
    try {
      const pendingArticles = await this.prisma.article_submissions.findMany({
        where: { status: { in: ['pending', 'in-review', 'revision'] } },
        orderBy: { created_at: 'desc' },
        take: SUBQUERY_TAKE_LIMIT,
      });

      for (const art of pendingArticles) {
        const artTitle = art.title.length > 50 ? `${art.title.slice(0, 47)}...` : art.title;
        rawItems.push({
          id: `article_submission:${art.id.toString()}`,
          type: 'article_submission',
          sourceId: art.id.toString(),
          title: `Article Submission: "${artTitle}"`,
          body: `Author: ${art.author} • Status: ${art.status}. Review required.`,
          source: 'overview',
          href: '/admin-dashboard',
          isRead: false,
          isDeleted: false,
          createdAt: (art.created_at || new Date()).toISOString(),
        });
      }
    } catch (err) {
      this.logger.error('Error querying article submissions for notifications:', err);
    }

    // 5. Newly Created Users (Registrations)
    try {
      const recentUsers = await this.prisma.users.findMany({
        where: { role: { in: ['member', 'organization'] } },
        orderBy: { created_at: 'desc' },
        take: SUBQUERY_TAKE_LIMIT,
      });

      for (const u of recentUsers) {
        const roleLabel = u.role.charAt(0).toUpperCase() + u.role.slice(1);
        rawItems.push({
          id: `new_registration:${u.id.toString()}`,
          type: 'new_registration',
          sourceId: u.id.toString(),
          title: `New Registration: ${u.name}`,
          body: `Registered as ${roleLabel} • ${u.university || u.email}`,
          source: 'manage-users',
          href: '/admin-dashboard/manage-users',
          isRead: false,
          isDeleted: false,
          createdAt: (u.created_at || new Date()).toISOString(),
        });
      }
    } catch (err) {
      this.logger.error('Error querying new users for notifications:', err);
    }

    // 6. User Activity Logs
    try {
      const recentActivities = await this.prisma.user_activities.findMany({
        include: { users: { select: { id: true, name: true, role: true } } },
        orderBy: { created_at: 'desc' },
        take: SUBQUERY_TAKE_LIMIT,
      });

      for (const act of recentActivities) {
        const actorName = act.users?.name || 'System';
        let source: AggregatedNotificationItem['source'] = 'overview';
        let href = '/admin-dashboard';

        const actionLower = act.action.toLowerCase();
        if (actionLower.includes('post') || actionLower.includes('article')) {
          source = 'approve-post';
          href = '/admin-dashboard/approve-post';
        } else if (actionLower.includes('user') || actionLower.includes('registered') || actionLower.includes('member')) {
          source = 'manage-users';
          href = '/admin-dashboard/manage-users';
        } else if (actionLower.includes('message')) {
          source = 'messages';
          href = '/admin-dashboard/view-messages';
        } else if (actionLower.includes('chapter')) {
          source = 'overview';
          href = '/admin-dashboard/chapters';
        } else if (actionLower.includes('convention')) {
          source = 'overview';
          href = '/admin-dashboard/conventions';
        }

        rawItems.push({
          id: `activity_log:${act.id.toString()}`,
          type: 'activity_log',
          sourceId: act.id.toString(),
          title: act.action,
          body: `Triggered by ${actorName} (${act.users?.role || 'member'}).`,
          source,
          href,
          isRead: false,
          isDeleted: false,
          createdAt: (act.created_at || new Date()).toISOString(),
        });
      }
    } catch (err) {
      this.logger.error('Error querying user activities for notifications:', err);
    }

    // Deduplicate on-the-fly items by ID
    const uniqueMap = new Map<string, AggregatedNotificationItem>();
    for (const item of rawItems) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }

    // Fetch persisted read/deleted state overrides from Notification table
    const itemIds = Array.from(uniqueMap.keys());
    const persistedStates = await this.prisma.notification.findMany({
      where: {
        id: { in: itemIds },
      },
    });

    const stateMap = new Map<string, { isRead: boolean; isDeleted: boolean }>();
    for (const ps of persistedStates) {
      stateMap.set(ps.id, { isRead: ps.isRead, isDeleted: ps.isDeleted });
    }

    // Filter out deleted items and apply read states
    const finalItems: AggregatedNotificationItem[] = [];
    for (const item of uniqueMap.values()) {
      const persisted = stateMap.get(item.id);
      if (persisted?.isDeleted) {
        continue;
      }
      if (persisted?.isRead) {
        item.isRead = true;
      }
      finalItems.push(item);
    }

    // Chronologically sort (newest first)
    finalItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return finalItems.slice(0, limit);
  }

  /**
   * Helper to parse deterministic notification ID into type and sourceId
   */
  private parseNotificationId(id: string): { type: string; sourceId: string } {
    const colonIndex = id.indexOf(':');
    if (colonIndex !== -1) {
      return {
        type: id.substring(0, colonIndex),
        sourceId: id.substring(colonIndex + 1),
      };
    }
    return {
      type: 'general',
      sourceId: id,
    };
  }

  /**
   * Marks a single notification as read, persisting it in the Notification table.
   */
  async markAsRead(id: string) {
    const { type, sourceId } = this.parseNotificationId(id);

    const updated = await this.prisma.notification.upsert({
      where: { id },
      update: { isRead: true },
      create: {
        id,
        type,
        sourceId,
        title: 'Notification',
        body: '',
        isRead: true,
        isDeleted: false,
      },
    });

    return {
      id: updated.id,
      isRead: updated.isRead,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Soft-deletes a single notification, persisting isDeleted = true.
   */
  async deleteNotification(id: string) {
    const { type, sourceId } = this.parseNotificationId(id);

    const updated = await this.prisma.notification.upsert({
      where: { id },
      update: { isDeleted: true },
      create: {
        id,
        type,
        sourceId,
        title: 'Notification',
        body: '',
        isRead: true,
        isDeleted: true,
      },
    });

    return {
      id: updated.id,
      isDeleted: updated.isDeleted,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Soft-deletes multiple notifications in a single batch operation.
   */
  async batchDelete(ids: string[]) {
    const results = await Promise.all(
      ids.map((id) => {
        const { type, sourceId } = this.parseNotificationId(id);
        return this.prisma.notification.upsert({
          where: { id },
          update: { isDeleted: true },
          create: {
            id,
            type,
            sourceId,
            title: 'Notification',
            body: '',
            isRead: true,
            isDeleted: true,
          },
        });
      }),
    );

    return {
      deletedCount: results.length,
      ids: results.map((r) => r.id),
    };
  }
}
