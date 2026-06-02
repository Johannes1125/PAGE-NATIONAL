<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ArticleSubmission;
use App\Models\UserActivity;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ArticleSubmissionController extends Controller
{
    /**
     * List article submissions with role constraints.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $submissions = ArticleSubmission::with(['user', 'reviewer'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $submissions = ArticleSubmission::where('user_id', $user->id)
                ->with(['reviewer'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'submissions' => $submissions
        ]);
    }

    /**
     * Submit an article.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'abstract' => 'required|string|min:20',
            'keywords' => 'required|array',
            'article_file' => 'required|file|mimes:pdf,docx|max:25600', // max 25MB PDF or DOCX
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Input validation failed.'
            ], 422);
        }

        // Upload research paper to Cloudinary in the "research" folder
        $url = CloudinaryService::upload($request->file('article_file'), 'research/submissions');

        if (!$url) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document to Cloudinary storage.'
            ], 500);
        }

        $submission = ArticleSubmission::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'author' => $request->author,
            'abstract' => $request->abstract,
            'keywords' => $request->keywords,
            'file_path' => $url,
            'file_name' => $request->file('article_file')->getClientOriginalName(),
            'status' => 'pending',
        ]);

        // Audit Trail log
        UserActivity::create([
            'user_id' => $user->id,
            'action' => "Submitted academic article for review: '{$submission->title}'.",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'submission' => $submission,
            'message' => 'Article submitted successfully and entered the pending queue.'
        ], 201);
    }
}
