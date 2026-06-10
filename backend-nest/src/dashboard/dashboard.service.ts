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
