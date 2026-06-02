<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ArticleSubmissionController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\MessageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Unified endpoint registrations for Next.js dashboards and landing page.
|
*/

// --- PUBLIC PORTS ---
Route::post('/login', [AuthController::class, 'login']);

// Landing Page: Fetch dynamic published posts (for dynamic homepage articles)
Route::get('/public/posts', [PostController::class, 'index'])->defaults('status', 'published');


// --- SECURE PORTS (Requires Authentication Token) ---
Route::middleware(['auth.token'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Posts Operations
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']); // Create new post (Draft or Pending)

    // Academic Research Submissions
    Route::get('/articles', [ArticleSubmissionController::class, 'index']);
    Route::post('/articles', [ArticleSubmissionController::class, 'store']);

    // Messaging & Chats
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{conversationId}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);

    // --- ROLE PRE-SELECTIONS ---

    // Organization Dashboard Overview Metrics
    Route::middleware(['role:organization,admin'])->group(function () {
        Route::get('/org/metrics', [DashboardController::class, 'orgMetrics']);
    });

    // --- ADMIN PANEL RESTRICTIONS (Only role:admin) ---
    Route::middleware(['role:admin'])->group(function () {
        
        // Admin Overview metrics and trends
        Route::get('/admin/metrics', [DashboardController::class, 'adminMetrics']);

        // Post Approvals / Moderation
        Route::post('/posts/{id}/approve', [PostController::class, 'approve']);
        Route::post('/posts/{id}/reject', [PostController::class, 'reject']);

        // User Accounts Control
        Route::get('/admin/users', [UserManagementController::class, 'index']);
        Route::patch('/admin/users/{id}', [UserManagementController::class, 'update']);
        Route::delete('/admin/users/{id}', [UserManagementController::class, 'deactivate']);
        Route::get('/admin/users/{id}/activities', [UserManagementController::class, 'activities']);

    });
});
