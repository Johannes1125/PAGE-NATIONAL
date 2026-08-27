import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private diffForHumans(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  private formatMonth(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }

  private groupCountByMonth(records: { created_at: Date | null }[]) {
    const counts: { [key: string]: { date: Date; count: number } } = {};
    
    records.forEach((r) => {
      if (!r.created_at) return;
      const date = new Date(r.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!counts[key]) {
        counts[key] = { date, count: 0 };
      }
      counts[key].count++;
    });

    return Object.values(counts)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => ({
        month: this.formatMonth(item.date),
        total: item.count,
      }));
  }

  private getRollingMonths(count = 6) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result: { key: string; month: string; year: number; date: Date }[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: months[d.getMonth()],
        year: d.getFullYear(),
        date: d,
      });
    }
    return result;
  }

  private getRollingDays(count = 7) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: { key: string; label: string; date: Date }[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      result.push({
        key,
        label: dayNames[d.getDay()],
        date: d,
      });
    }
    return result;
  }

  private getRollingYears(count = 4) {
    const currentYear = new Date().getFullYear();
    const result: { year: number; label: string }[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const year = currentYear - i;
      result.push({ year, label: year.toString() });
    }
    return result;
  }

  private calculatePeriodTrends(records: { created_at: Date | null }[]) {
    // 1. Monthly (last 6 months)
    const rollingMonths = this.getRollingMonths(6);
    const monthCounts: Record<string, number> = {};
    rollingMonths.forEach((m) => {
      monthCounts[m.key] = 0;
    });

    // 2. Daily (last 7 days)
    const rollingDays = this.getRollingDays(7);
    const dayCounts: Record<string, number> = {};
    rollingDays.forEach((d) => {
      dayCounts[d.key] = 0;
    });

    // 3. Yearly (last 4 years)
    const rollingYears = this.getRollingYears(4);
    const yearCounts: Record<number, number> = {};
    rollingYears.forEach((y) => {
      yearCounts[y.year] = 0;
    });

    records.forEach((r) => {
      if (!r.created_at) return;
      const date = new Date(r.created_at);

      const mKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthCounts[mKey] !== undefined) {
        monthCounts[mKey]++;
      }

      const dKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (dayCounts[dKey] !== undefined) {
        dayCounts[dKey]++;
      }

      const yr = date.getFullYear();
      if (yearCounts[yr] !== undefined) {
        yearCounts[yr]++;
      }
    });

    return {
      monthly: rollingMonths.map((m) => ({
        month: m.month,
        year: m.year,
        count: monthCounts[m.key] || 0,
      })),
      daily: rollingDays.map((d) => ({
        day: d.label,
        count: dayCounts[d.key] || 0,
      })),
      yearly: rollingYears.map((y) => ({
        year: y.label,
        count: yearCounts[y.year] || 0,
      })),
    };
  }

  async adminMetrics() {
    const totalUsers = await this.prisma.users.count();
    const totalOrgs = await this.prisma.users.count({
      where: { role: 'organization' },
    });
    const totalAdmins = await this.prisma.users.count({
      where: { role: 'admin' },
    });
    const totalMembers = await this.prisma.users.count({
      where: { role: 'member' },
    });

    const pendingPosts = await this.prisma.posts.count({
      where: { status: 'pending' },
    });
    const publishedPosts = await this.prisma.posts.count({
      where: { status: 'published' },
    });
    const draftPosts = await this.prisma.posts.count({
      where: { status: 'draft' },
    });
    const rejectedPosts = await this.prisma.posts.count({
      where: { status: 'rejected' },
    });

    // Recent Activity Feed (Limit 10)
    const recentActivitiesRaw = await this.prisma.user_activities.findMany({
      include: {
        users: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10,
    });

    const recentActivities = recentActivitiesRaw.map((act) => ({
      id: act.id.toString(),
      userName: act.users ? act.users.name : 'System',
      role: act.users ? act.users.role.charAt(0).toUpperCase() + act.users.role.slice(1) : 'System',
      action: act.action,
      timestamp: act.created_at ? this.diffForHumans(act.created_at) : 'just now',
      rawDate: act.created_at,
    }));

    // Post Trends
    const posts = await this.prisma.posts.findMany({
      select: { created_at: true },
    });
    const postPeriodTrends = this.calculatePeriodTrends(posts);
    const trends = postPeriodTrends.monthly.map((row) => ({
      month: row.month,
      submissions: row.count,
    }));

    // User Growth
    const users = await this.prisma.users.findMany({
      select: { created_at: true },
    });
    const userPeriodTrends = this.calculatePeriodTrends(users);
    const growth = userPeriodTrends.monthly.map((row) => ({
      month: row.month,
      users: row.count,
    }));

    // ─── Content Publishing Analytics ─────────────────────────────────────
    const allPosts = await this.prisma.posts.findMany({
      select: { category: true, status: true, published_at: true, created_at: true },
    });

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    allPosts.forEach((p) => {
      const rawCat = p.category ? p.category.trim() : 'General';
      const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Status breakdown
    const statusMap: Record<string, number> = {
      draft: draftPosts,
      pending: pendingPosts,
      published: publishedPosts,
      rejected: rejectedPosts,
    };
    const statusBreakdown = [
      { name: 'published', count: publishedPosts },
      { name: 'pending', count: pendingPosts },
      { name: 'draft', count: draftPosts },
      { name: 'rejected', count: rejectedPosts },
    ].filter((s) => s.count > 0 || allPosts.length === 0);

    const contentAnalytics = {
      categoryBreakdown,
      statusBreakdown,
      periodTrends: postPeriodTrends,
      totalDraft: draftPosts,
      totalPending: pendingPosts,
      totalPublished: publishedPosts,
      totalRejected: rejectedPosts,
    };

    // ─── User Activity Analytics ──────────────────────────────────────────
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Active sessions (distinct active users in last 30 min, fallback minimum 1 for current admin)
    let activeSessions = 0;
    try {
      const activeUsersRaw = await this.prisma.user_activities.findMany({
        where: {
          created_at: { gte: thirtyMinAgo },
        },
        select: { user_id: true },
        distinct: ['user_id'],
      });
      activeSessions = Math.max(1, activeUsersRaw.length);
    } catch {
      activeSessions = 1;
    }

    // Total sessions (all login actions recorded or all distinct sessions)
    let totalSessions = 0;
    try {
      const loginCount = await this.prisma.user_activities.count({
        where: {
          action: { contains: 'Logged in' },
        },
      });
      const totalActivitiesCount = await this.prisma.user_activities.count();
      totalSessions = Math.max(activeSessions, loginCount > 0 ? loginCount : totalActivitiesCount);
    } catch {
      totalSessions = activeSessions;
    }

    // Activity timeline — count activities per hour for the last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentUserActivities = await this.prisma.user_activities.findMany({
      where: {
        created_at: { gte: sevenDaysAgo },
      },
      select: { created_at: true },
    });

    // Build 7×24 grid (day × hour)
    const heatMapData: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0),
    );
    recentUserActivities.forEach((act) => {
      if (!act.created_at) return;
      const d = new Date(act.created_at);
      const dayIndex = Math.floor(
        (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (dayIndex >= 0 && dayIndex < 7) {
        heatMapData[6 - dayIndex][d.getHours()]++;
      }
    });

    // Top 5 most active users (by activity count in last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activityCounts = await this.prisma.user_activities.groupBy({
      by: ['user_id'],
      where: {
        created_at: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topUserIds = activityCounts.map((a) => a.user_id);
    const topUsersRaw = topUserIds.length > 0
      ? await this.prisma.users.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, name: true, role: true, email: true },
        })
      : [];

    const topActiveUsers = activityCounts.map((ac) => {
      const user = topUsersRaw.find((u) => u.id === ac.user_id);
      return {
        userId: ac.user_id.toString(),
        name: user?.name || 'User #' + ac.user_id.toString(),
        role: user?.role || 'member',
        email: user?.email || '',
        activityCount: ac._count.id,
      };
    });

    const userActivityAnalytics = {
      activeSessions,
      totalSessions,
      heatMapData,
      topActiveUsers,
      totalActivitiesLast7Days: recentUserActivities.length,
    };

    // ─── User Growth Analytics ────────────────────────────────────────────
    // Role distribution
    const allUsers = await this.prisma.users.findMany({
      select: { role: true },
    });
    const roleMap: Record<string, number> = {
      admin: totalAdmins,
      organization: totalOrgs,
      member: totalMembers,
    };
    const roleDistribution = [
      { role: 'admin', count: totalAdmins },
      { role: 'organization', count: totalOrgs },
      { role: 'member', count: totalMembers },
    ].filter((r) => r.count > 0 || totalUsers === 0);

    // Membership application stats
    let membershipStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
    try {
      const membershipApps = await this.prisma.membershipApplication.findMany({
        select: { status: true },
      });
      membershipApps.forEach((app) => {
        membershipStats.total++;
        const st = (app.status || '').toLowerCase();
        if (st === 'pending' || st === 'under_review' || st === 'submitted') {
          membershipStats.pending++;
        } else if (st === 'approved') {
          membershipStats.approved++;
        } else if (st === 'rejected') {
          membershipStats.rejected++;
        }
      });
    } catch {
      // MembershipApplication table may not exist
    }

    // Count new users in last 30 days
    let newUsersLast30Days = 0;
    try {
      newUsersLast30Days = await this.prisma.users.count({
        where: { created_at: { gte: thirtyDaysAgo } },
      });
    } catch {
      newUsersLast30Days = 0;
    }

    const userGrowthAnalytics = {
      roleDistribution,
      membershipStats,
      totalNewUsersLast30Days: newUsersLast30Days,
      periodTrends: userPeriodTrends,
    };

    // ─── System & Security Metrics ────────────────────────────────────────
    let failedLogins = 0;
    let recentSecurityEvents: any[] = [];
    try {
      const failedLoginActivities = await this.prisma.user_activities.findMany({
        where: {
          action: { contains: 'failed' },
          created_at: { gte: sevenDaysAgo },
        },
        include: { users: { select: { name: true, email: true } } },
        orderBy: { created_at: 'desc' },
        take: 10,
      });
      failedLogins = failedLoginActivities.length;

      // Also get any security/audit activities
      const auditActivities = await this.prisma.user_activities.findMany({
        where: {
          OR: [
            { action: { contains: 'failed' } },
            { action: { contains: 'password' } },
            { action: { contains: 'deactivated' } },
            { action: { contains: 'role' } },
          ],
          created_at: { gte: sevenDaysAgo },
        },
        include: { users: { select: { name: true, email: true } } },
        orderBy: { created_at: 'desc' },
        take: 8,
      });

      recentSecurityEvents = auditActivities.map((e) => ({
        id: e.id.toString(),
        action: e.action,
        ip: e.ip_address || '127.0.0.1',
        user: e.users?.name || 'System / Guest',
        time: e.created_at ? this.diffForHumans(e.created_at) : 'just now',
      }));
    } catch {
      failedLogins = 0;
    }

    // Unique IPs in last 7 days
    let uniqueIPs = 1;
    try {
      const ipActivities = await this.prisma.user_activities.findMany({
        where: {
          created_at: { gte: sevenDaysAgo },
          ip_address: { not: null },
        },
        select: { ip_address: true },
        distinct: ['ip_address'],
      });
      uniqueIPs = Math.max(1, ipActivities.length);
    } catch {
      uniqueIPs = 1;
    }

    // Dynamic accurate security score (0-100)
    let securityScore = 95;
    if (failedLogins > 20) securityScore -= 30;
    else if (failedLogins > 10) securityScore -= 20;
    else if (failedLogins > 0) securityScore -= Math.min(15, failedLogins * 3);

    // Deactivated user check
    const deactivatedUsers = await this.prisma.users.count({
      where: { status: 'deactivated' },
    });
    if (deactivatedUsers > 0) securityScore -= Math.min(10, deactivatedUsers * 2);

    securityScore = Math.max(50, Math.min(100, securityScore));

    const systemAnalytics = {
      activeSessions,
      totalSessions,
      failedLoginsLast7Days: failedLogins,
      uniqueIPsLast7Days: uniqueIPs,
      securityScore,
      recentSecurityEvents,
      totalActivities: recentUserActivities.length,
    };

    return {
      success: true,
      metrics: {
        totalUsers,
        totalOrgs,
        totalAdmins,
        totalMembers,
        pendingPosts,
        publishedPosts,
        draftPosts,
        rejectedPosts,
      },
      recentActivities,
      trends,
      growth,
      contentAnalytics,
      userActivityAnalytics,
      userGrowthAnalytics,
      systemAnalytics,
    };
  }

  async adminNotifications() {
    type NotificationItem = {
      id: string;
      title: string;
      description: string;
      source: 'overview' | 'create-post' | 'approve-post' | 'manage-users' | 'messages';
      timeLabel: string;
      href: string;
      rawDate: string;
    };

    const notifications: NotificationItem[] = [];

    // 1. Pending Posts (requiring admin moderation)
    try {
      const pendingPosts = await this.prisma.posts.findMany({
        where: { status: 'pending' },
        include: { users: true },
        orderBy: { created_at: 'desc' },
        take: 10,
      });

      for (const post of pendingPosts) {
        notifications.push({
          id: `pending-post-${post.id.toString()}`,
          title: `Post Pending Approval: "${post.title.length > 42 ? post.title.slice(0, 40) + '...' : post.title}"`,
          description: `Submitted by ${post.author || post.users?.name || 'Author'} in ${post.category}. Moderation review required.`,
          source: 'approve-post',
          timeLabel: post.created_at ? this.diffForHumans(post.created_at) : 'Active',
          href: '/admin-dashboard/approve-post',
          rawDate: post.created_at ? post.created_at.toISOString() : new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching pending posts for admin notifications:', err);
    }

    // 2. Pending Membership Applications
    try {
      const pendingApps = await this.prisma.membershipApplication.findMany({
        where: {
          status: { in: ['submitted', 'under_review', 'draft'] },
        },
        include: { applicant: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      for (const app of pendingApps) {
        let applicantName = app.applicant?.name;
        if (!applicantName && app.profileData && typeof app.profileData === 'object') {
          const pd: any = app.profileData;
          applicantName = [pd.firstName, pd.lastName].filter(Boolean).join(' ');
        }
        applicantName = applicantName || 'Applicant';

        const statusLabel =
          app.status === 'submitted'
            ? 'Submitted'
            : app.status === 'under_review'
            ? 'Under Review'
            : 'Draft Incomplete';

        notifications.push({
          id: `membership-app-${app.id}`,
          title: `Membership Application: ${applicantName}`,
          description: `${app.membershipType} membership application (${statusLabel}) awaiting review.`,
          source: 'manage-users',
          timeLabel: app.submittedAt ? this.diffForHumans(app.submittedAt) : this.diffForHumans(app.createdAt),
          href: '/admin-dashboard/membership-applications',
          rawDate: (app.submittedAt || app.createdAt).toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching membership applications for admin notifications:', err);
    }

    // 3. Inbound Messages & Inquiries
    try {
      const recentMessages = await this.prisma.messages.findMany({
        where: {
          users_messages_sender_idTousers: {
            role: { not: 'admin' },
          },
        },
        include: {
          users_messages_sender_idTousers: true,
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      });

      for (const msg of recentMessages) {
        const senderName = msg.users_messages_sender_idTousers?.name || 'Inquirer';
        notifications.push({
          id: `msg-${msg.id.toString()}`,
          title: `New Message from ${senderName}`,
          description: `${msg.subject ? `[${msg.subject}] ` : ''}${
            msg.text.length > 55 ? msg.text.slice(0, 52) + '...' : msg.text
          }`,
          source: 'messages',
          timeLabel: msg.created_at ? this.diffForHumans(msg.created_at) : 'recently',
          href: '/admin-dashboard/view-messages',
          rawDate: msg.created_at ? msg.created_at.toISOString() : new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching messages for admin notifications:', err);
    }

    // 4. Pending Article Submissions
    try {
      const pendingArticles = await this.prisma.article_submissions.findMany({
        where: { status: { in: ['pending', 'in-review', 'revision'] } },
        orderBy: { created_at: 'desc' },
        take: 8,
      });

      for (const art of pendingArticles) {
        notifications.push({
          id: `article-${art.id.toString()}`,
          title: `Article Submission: "${art.title.length > 42 ? art.title.slice(0, 40) + '...' : art.title}"`,
          description: `Author: ${art.author} • Status: ${art.status}.`,
          source: 'overview',
          timeLabel: art.created_at ? this.diffForHumans(art.created_at) : 'recently',
          href: '/admin-dashboard',
          rawDate: art.created_at ? art.created_at.toISOString() : new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching article submissions for admin notifications:', err);
    }

    // 5. Recent User Registrations
    try {
      const recentUsers = await this.prisma.users.findMany({
        where: { role: { in: ['member', 'organization'] } },
        orderBy: { created_at: 'desc' },
        take: 8,
      });

      for (const u of recentUsers) {
        notifications.push({
          id: `user-reg-${u.id.toString()}`,
          title: `New Account: ${u.name}`,
          description: `Registered as ${u.role.charAt(0).toUpperCase() + u.role.slice(1)} • ${
            u.university || u.email
          }`,
          source: 'manage-users',
          timeLabel: u.created_at ? this.diffForHumans(u.created_at) : 'recently',
          href: '/admin-dashboard/manage-users',
          rawDate: u.created_at ? u.created_at.toISOString() : new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching recent users for admin notifications:', err);
    }

    // 6. Recent User Activities (System Audit Events)
    try {
      const recentActivities = await this.prisma.user_activities.findMany({
        include: { users: true },
        orderBy: { created_at: 'desc' },
        take: 12,
      });

      for (const act of recentActivities) {
        const actorName = act.users?.name || 'System';
        const time = act.created_at ? this.diffForHumans(act.created_at) : 'recently';
        let source: 'overview' | 'create-post' | 'approve-post' | 'manage-users' | 'messages' = 'overview';
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

        notifications.push({
          id: `activity-${act.id.toString()}`,
          title: act.action,
          description: `Triggered by ${actorName} (${act.users?.role || 'member'}).`,
          source,
          timeLabel: time,
          href,
          rawDate: act.created_at ? act.created_at.toISOString() : new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching recent activities for admin notifications:', err);
    }

    // Deduplicate by ID
    const uniqueMap = new Map<string, NotificationItem>();
    for (const item of notifications) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }

    const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
      const timeA = new Date(a.rawDate).getTime();
      const timeB = new Date(b.rawDate).getTime();
      return timeB - timeA;
    });

    return {
      success: true,
      data: sorted.slice(0, 30),
    };
  }

  async orgMetrics(orgUser: any) {
    const pendingPosts = await this.prisma.posts.count({
      where: { user_id: orgUser.id, status: 'pending' },
    });
    const approvedPosts = await this.prisma.posts.count({
      where: { user_id: orgUser.id, status: 'published' },
    });
    const rejectedPosts = await this.prisma.posts.count({
      where: { user_id: orgUser.id, status: 'rejected' },
    });
    
    const activeReviewsCount = await this.prisma.article_submissions.count({
      where: {
        user_id: orgUser.id,
        status: { in: ['pending', 'in-review', 'revision'] },
      },
    });

    // Get active reviews with reviewer info
    const activeReviewsRaw = await this.prisma.article_submissions.findMany({
      where: {
        user_id: orgUser.id,
        status: { in: ['pending', 'in-review', 'revision'] },
      },
      include: {
        users_article_submissions_reviewer_idTousers: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const activeReviews = activeReviewsRaw.map((sub) => {
      const reviewer = sub.users_article_submissions_reviewer_idTousers;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let dueDateFormatted = 'No Due Date';
      if (sub.due_date) {
        const date = new Date(sub.due_date);
        dueDateFormatted = `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
      }

      return {
        id: sub.id.toString(),
        title: sub.title,
        reviewer: reviewer ? reviewer.name : 'Unassigned Reviewer',
        dueDate: dueDateFormatted,
        status: (sub.status === 'pending' || sub.status === 'in-review') ? 'in-review' : 'revision',
      };
    });

    // Dynamic membership requests from same university (unapproved/recent members)
    const membershipRequestsRaw = await this.prisma.users.findMany({
      where: {
        university: orgUser.university,
        role: 'member',
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    const membershipRequests = membershipRequestsRaw.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      submittedAt: u.created_at ? this.diffForHumans(u.created_at) : 'some time ago',
    }));

    // Recent Activity Feed for this organization
    const recentActivitiesRaw = await this.prisma.user_activities.findMany({
      where: { user_id: orgUser.id },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    const recentActivities = recentActivitiesRaw.map((act) => ({
      id: act.id.toString(),
      action: act.action,
      timestamp: act.created_at ? this.diffForHumans(act.created_at) : 'some time ago',
    }));

    // System data logs (detailed actions logs)
    const organizationDataLogs = recentActivitiesRaw.map((act) => ({
      id: act.id.toString(),
      entry: act.action,
      source: act.ip_address ? `IP: ${act.ip_address}` : 'Supabase Hook',
      time: act.created_at ? this.diffForHumans(act.created_at) : 'some time ago',
    }));

    return {
      success: true,
      metrics: {
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        activeReviews: activeReviewsCount,
      },
      activeReviewsList: activeReviews,
      membershipRequests,
      recentActivities,
      organizationDataLogs,
    };
  }
}
