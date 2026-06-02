<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostAttachment;
use App\Models\UserActivity;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * List posts with optional filters.
     */
    public function index(Request $request)
    {
        $query = Post::with('attachments');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $posts = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'posts' => $posts
        ]);
    }

    /**
     * Create and store a new post (for Admins or Organizations).
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:article,research,journal,announcement',
            'content_html' => 'required|string',
            'excerpt' => 'nullable|string',
            'assigned_members' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'status' => 'required|string|in:draft,pending,published',
            'featured_image' => 'nullable|image|max:10240', // max 10MB
            'proof_of_payment' => 'nullable|image|max:10240', // max 10MB
            'supporting_file' => 'nullable|file|max:20480', // max 20MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Input validation failed.'
            ], 422);
        }

        // Security check: Organizations cannot post as published immediately.
        $status = $request->status;
        if ($user->role === 'organization' && $status === 'published') {
            $status = 'pending';
        }

        $post = Post::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'category' => $request->category,
            'author' => $user->name,
            'excerpt' => $request->excerpt,
            'content_html' => $request->content_html,
            'status' => $status,
            'assigned_members' => $request->assigned_members,
            'scheduled_at' => $request->scheduled_at,
            'published_at' => ($status === 'published') ? now() : null,
        ]);

        // Upload and bind featured image
        if ($request->hasFile('featured_image')) {
            $url = CloudinaryService::upload($request->file('featured_image'), 'posts/featured');
            if ($url) {
                PostAttachment::create([
                    'post_id' => $post->id,
                    'file_path' => $url,
                    'file_type' => 'featured_image',
                    'file_name' => $request->file('featured_image')->getClientOriginalName(),
                ]);
            }
        }

        // Upload and bind proof of payment
        if ($request->hasFile('proof_of_payment')) {
            $url = CloudinaryService::upload($request->file('proof_of_payment'), 'posts/payments');
            if ($url) {
                PostAttachment::create([
                    'post_id' => $post->id,
                    'file_path' => $url,
                    'file_type' => 'proof_of_payment',
                    'file_name' => $request->file('proof_of_payment')->getClientOriginalName(),
                ]);
            }
        }

        // Upload and bind supporting document
        if ($request->hasFile('supporting_file')) {
            $url = CloudinaryService::upload($request->file('supporting_file'), 'posts/supporting');
            if ($url) {
                PostAttachment::create([
                    'post_id' => $post->id,
                    'file_path' => $url,
                    'file_type' => 'supporting',
                    'file_name' => $request->file('supporting_file')->getClientOriginalName(),
                ]);
            }
        }

        // Log action in audit trail
        UserActivity::create([
            'user_id' => $user->id,
            'action' => "Created a new post: '{$post->title}' with status '{$post->status}'.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'post' => $post->load('attachments'),
            'message' => 'Post created successfully.'
        ], 201);
    }

    /**
     * Admin Action: Approve pending post.
     */
    public function approve(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.'
            ], 404);
        }

        if ($post->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Post is not in pending status.'
            ], 400);
        }

        $post->status = 'published';
        $post->published_at = now();
        $post->save();

        // Audit Trail log
        UserActivity::create([
            'user_id' => Auth::id(),
            'action' => "Approved post #{$post->id}: '{$post->title}'.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'post' => $post,
            'message' => 'Post approved and published successfully.'
        ]);
    }

    /**
     * Admin Action: Reject pending post with feedback.
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'feedback' => 'required|string|min:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Rejection feedback is required.'
            ], 422);
        }

        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.'
            ], 404);
        }

        if ($post->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Post is not in pending status.'
            ], 400);
        }

        $post->status = 'rejected';
        $post->feedback = $request->feedback;
        $post->save();

        // Audit Trail log
        UserActivity::create([
            'user_id' => Auth::id(),
            'action' => "Rejected post #{$post->id}: '{$post->title}'. Feedback provided.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'post' => $post,
            'message' => 'Post rejected successfully.'
        ]);
    }
}
