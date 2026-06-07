<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Post;
use App\Models\ArticleSubmission;
use App\Models\UserActivity;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Aggregated metrics for Admin Dashboard Overview
     */
    public function adminMetrics(Request $request)
    {
        $totalUsers = User::count();
        $totalOrgs = User::where('role', 'organization')->count();
        $pendingPosts = Post::where('status', 'pending')->count();
        $publishedPosts = Post::where('status', 'published')->count();

        // Recent Activity Feed (Limit 6)
        $recentActivities = UserActivity::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'userName' => $act->user ? $act->user->name : 'System',
                    'role' => $act->user ? ucfirst($act->user->role) : 'System',
                    'action' => $act->action,
                    'timestamp' => $act->created_at->diffForHumans(),
                ];
            });

        // Content Trends (monthly counts of posts grouped by category/created_at)
        $isSqlite = DB::connection()->getDriverName() === 'sqlite';
        $monthFormat = $isSqlite ? "strftime('%m', created_at)" : "to_char(created_at, 'MM')";
        
        $trends = Post::select(
            DB::raw("min(created_at) as c_date"),
            DB::raw("count(*) as total")
        )
            ->groupBy(DB::raw($monthFormat))
            ->orderBy('c_date', 'asc')
            ->get()
            ->map(function ($row) {
                $date = \Carbon\Carbon::parse($row->c_date);
                return [
                    'month' => $date->format('M'),
                    'submissions' => $row->total,
                ];
            });

        // User Growth monthly data
        $growth = User::select(
            DB::raw("min(created_at) as c_date"),
            DB::raw("count(*) as total")
        )
            ->groupBy(DB::raw($monthFormat))
            ->orderBy('c_date', 'asc')
            ->get()
            ->map(function ($row) {
                $date = \Carbon\Carbon::parse($row->c_date);
                return [
                    'month' => $date->format('M'),
                    'users' => $row->total,
                ];
            });

        return response()->json([
            'success' => true,
            'metrics' => [
                'totalUsers' => $totalUsers,
                'totalOrgs' => $totalOrgs,
                'pendingPosts' => $pendingPosts,
                'publishedPosts' => $publishedPosts,
            ],
            'recentActivities' => $recentActivities,
            'trends' => $trends,
            'growth' => $growth,
        ]);
    }

    /**
     * Aggregated metrics for Organization Dashboard Overview
     */
    public function orgMetrics(Request $request)
    {
        $user = $request->user();

        $pendingPosts = Post::where('user_id', $user->id)->where('status', 'pending')->count();
        $approvedPosts = Post::where('user_id', $user->id)->where('status', 'published')->count();
        $rejectedPosts = Post::where('user_id', $user->id)->where('status', 'rejected')->count();
        
        $activeReviewsCount = ArticleSubmission::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'in-review', 'revision'])
            ->count();

        // Get actual active reviews with reviewer info
        $activeReviews = ArticleSubmission::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'in-review', 'revision'])
            ->with('reviewer')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => (string) $sub->id,
                    'title' => $sub->title,
                    'reviewer' => $sub->reviewer ? $sub->reviewer->name : 'Unassigned Reviewer',
                    'dueDate' => $sub->due_date ? $sub->due_date->format('M d, Y') : 'No Due Date',
                    'status' => ($sub->status === 'pending' || $sub->status === 'in-review') ? 'in-review' : 'revision',
                ];
            });
 
        // Dynamic membership requests from same university (unapproved/recent members)
        $membershipRequests = User::where('university', $user->university)
            ->where('role', 'member')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => (string) $u->id,
                    'name' => $u->name,
                    'role' => ucfirst($u->role),
                    'submittedAt' => $u->created_at->diffForHumans(),
                ];
            });
 
        // Recent Activity Feed for this organization
        $recentActivities = UserActivity::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => (string) $act->id,
                    'action' => $act->action,
                    'timestamp' => $act->created_at->diffForHumans(),
                ];
            });
 
        // System data logs (detailed actions logs)
        $organizationDataLogs = UserActivity::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => (string) $act->id,
                    'entry' => $act->action,
                    'source' => $act->ip_address ? "IP: {$act->ip_address}" : 'Supabase Hook',
                    'time' => $act->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'metrics' => [
                'pendingPosts' => $pendingPosts,
                'approvedPosts' => $approvedPosts,
                'rejectedPosts' => $rejectedPosts,
                'activeReviews' => $activeReviewsCount,
            ],
            'activeReviewsList' => $activeReviews,
            'membershipRequests' => $membershipRequests,
            'recentActivities' => $recentActivities,
            'organizationDataLogs' => $organizationDataLogs,
        ]);
    }
}
