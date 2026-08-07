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

  async adminMetrics() {
    const totalUsers = await this.prisma.users.count();
    const totalOrgs = await this.prisma.users.count({
      where: { role: 'organization' },
    });
    const pendingPosts = await this.prisma.posts.count({
      where: { status: 'pending' },
    });
    const publishedPosts = await this.prisma.posts.count({
      where: { status: 'published' },
    });

    // Recent Activity Feed (Limit 6)
    const recentActivitiesRaw = await this.prisma.user_activities.findMany({
      include: {
        users: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 6,
    });

    const recentActivities = recentActivitiesRaw.map((act) => ({
      id: act.id,
      userName: act.users ? act.users.name : 'System',
      role: act.users ? act.users.role.charAt(0).toUpperCase() + act.users.role.slice(1) : 'System',
      action: act.action,
      timestamp: act.created_at ? this.diffForHumans(act.created_at) : 'some time ago',
    }));

    // Post Trends
    const posts = await this.prisma.posts.findMany({
      select: { created_at: true },
    });
    const trends = this.groupCountByMonth(posts).map((row) => ({
      month: row.month,
      submissions: row.total,
    }));

    // User Growth
    const users = await this.prisma.users.findMany({
      select: { created_at: true },
    });
    const growth = this.groupCountByMonth(users).map((row) => ({
      month: row.month,
      users: row.total,
    }));

    // ─── Content Publishing Analytics ─────────────────────────────────────
    const allPosts = await this.prisma.posts.findMany({
      select: { category: true, status: true, published_at: true, created_at: true },
    });

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    allPosts.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Status breakdown
    const statusMap: Record<string, number> = {};
    allPosts.forEach((p) => {
      const st = p.status || 'unknown';
      statusMap[st] = (statusMap[st] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Monthly publishing trend (only published_at posts)
    const publishedPosts_ = allPosts.filter((p) => p.published_at);
    const publishingTrend = this.groupCountByMonth(
      publishedPosts_.map((p) => ({ created_at: p.published_at })),
    ).map((row) => ({
      month: row.month,
      published: row.total,
    }));

    const contentAnalytics = {
      categoryBreakdown,
      statusBreakdown,
      publishingTrend,
      totalDraft: statusMap['draft'] || 0,
      totalPending: statusMap['pending'] || 0,
      totalPublished: statusMap['published'] || 0,
      totalRejected: statusMap['rejected'] || 0,
    };

    // ─── User Activity Analytics ──────────────────────────────────────────
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const thirtyMinUnix = Math.floor(thirtyMinAgo.getTime() / 1000);

    // Active sessions (last_activity within 30 minutes)
    let activeSessions = 0;
    try {
      activeSessions = await this.prisma.sessions.count({
        where: {
          last_activity: { gte: thirtyMinUnix },
        },
      });
    } catch {
      activeSessions = 0;
    }

    // Total sessions
    let totalSessions = 0;
    try {
      totalSessions = await this.prisma.sessions.count();
    } catch {
      totalSessions = 0;
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
        name: user?.name || 'Unknown',
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
    const roleMap: Record<string, number> = {};
    allUsers.forEach((u) => {
      const r = u.role || 'member';
      roleMap[r] = (roleMap[r] || 0) + 1;
    });
    const roleDistribution = Object.entries(roleMap)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);

    // Membership application stats
    let membershipStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
    try {
      const membershipApps = await this.prisma.membershipApplication.findMany({
        select: { status: true },
      });
      membershipApps.forEach((app) => {
        membershipStats.total++;
        const st = (app.status || '').toLowerCase();
        if (st === 'pending' || st === 'under_review') membershipStats.pending++;
        else if (st === 'approved') membershipStats.approved++;
        else if (st === 'rejected') membershipStats.rejected++;
      });
    } catch {
      // MembershipApplication table may not exist yet
    }

    const userGrowthAnalytics = {
      roleDistribution,
      membershipStats,
      totalNewUsersLast30Days: allUsers.filter(() => false).length, // placeholder
    };

    // Count new users in last 30 days
    try {
      const newUsersCount = await this.prisma.users.count({
        where: { created_at: { gte: thirtyDaysAgo } },
      });
      userGrowthAnalytics.totalNewUsersLast30Days = newUsersCount;
    } catch {
      // fallback
    }

    // ─── System & Security Metrics ────────────────────────────────────────
    // Failed login detection from user_activities
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
      recentSecurityEvents = failedLoginActivities.map((e) => ({
        id: e.id.toString(),
        action: e.action,
        ip: e.ip_address || 'Unknown',
        user: e.users?.name || 'Unknown',
        time: e.created_at ? this.diffForHumans(e.created_at) : 'some time ago',
      }));
    } catch {
      // fallback
    }

    // Unique IPs in last 7 days
    let uniqueIPs = 0;
    try {
      const ipActivities = await this.prisma.user_activities.findMany({
        where: {
          created_at: { gte: sevenDaysAgo },
          ip_address: { not: null },
        },
        select: { ip_address: true },
        distinct: ['ip_address'],
      });
      uniqueIPs = ipActivities.length;
    } catch {
      // fallback
    }

    // Compute security score (0-100)
    // Factors: low failed logins = good, diverse sessions = neutral, active users = good
    let securityScore = 85; // base score
    if (failedLogins > 20) securityScore -= 30;
    else if (failedLogins > 10) securityScore -= 20;
    else if (failedLogins > 5) securityScore -= 10;
    else if (failedLogins === 0) securityScore += 10;

    // Bonus for active monitoring (recent activities exist)
    if (recentUserActivities.length > 0) securityScore += 5;

    // Cap score
    securityScore = Math.max(0, Math.min(100, securityScore));

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
        pendingPosts,
        publishedPosts,
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
