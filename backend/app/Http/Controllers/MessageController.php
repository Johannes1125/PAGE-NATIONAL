<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Get conversation threads list grouped by conversation_id.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get latest message from each conversation thread
        $subQuery = Message::select('conversation_id', \DB::raw('MAX(created_at) as max_created_at'))
            ->groupBy('conversation_id');

        $threadsQuery = Message::joinSub($subQuery, 'latest', function ($join) {
                $join->on('messages.conversation_id', '=', 'latest.conversation_id')
                     ->on('messages.created_at', '=', 'latest.max_created_at');
            })
            ->with(['sender', 'receiver'])
            ->orderBy('messages.created_at', 'desc');

        // Non-admins can only see conversations they participate in
        if ($user->role !== 'admin') {
            $threadsQuery->where(function ($q) use ($user) {
                $q->where('messages.sender_id', $user->id)
                  ->orWhere('messages.receiver_id', $user->id);
            });
        }

        $messages = $threadsQuery->get();

        $threads = $messages->map(function ($msg) use ($user) {
            // Determine corresponding participant
            $partner = ($msg->sender_id === $user->id) ? $msg->receiver : $msg->sender;
            $partnerName = $partner ? $partner->name : 'General User';
            $partnerRole = $partner ? $partner->role : 'user';

            return [
                'conversationId' => $msg->conversation_id,
                'name' => $partnerName,
                'role' => $partnerRole,
                'subject' => $msg->subject ?? 'Inquiry',
                'lastMessage' => $msg->text,
                'timestamp' => $msg->created_at->diffForHumans(),
                'unread' => ($msg->status === 'sent' && $msg->receiver_id === $user->id),
                'tag' => ($partnerRole === 'admin') ? 'admin' : (($partnerRole === 'organization') ? 'organization' : 'users'),
            ];
        });

        return response()->json([
            'success' => true,
            'threads' => $threads
        ]);
    }

    /**
     * Get all messages in a specific thread, and mark incoming messages as read.
     */
    public function show(Request $request, $conversationId)
    {
        $user = Auth::user();

        $messages = Message::where('conversation_id', $conversationId)
            ->with(['sender', 'attachments'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages received by this user as read
        Message::where('conversation_id', $conversationId)
            ->where('receiver_id', $user->id)
            ->where('status', 'sent')
            ->update(['status' => 'read']);

        $formatted = $messages->map(function ($msg) {
            return [
                'id' => $msg->id,
                'senderId' => $msg->sender_id,
                'senderName' => $msg->sender ? $msg->sender->name : 'System',
                'senderRole' => $msg->sender ? $msg->sender->role : 'user',
                'text' => $msg->text,
                'status' => $msg->status,
                'timestamp' => $msg->created_at->format('M d, Y h:i A'),
                'attachments' => $msg->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'filePath' => $att->file_path,
                        'fileName' => $att->file_name,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'messages' => $formatted
        ]);
    }

    /**
     * Send a message inside a thread (or start a new one).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|string',
            'receiver_id' => 'nullable|integer|exists:users,id',
            'text' => 'required|string',
            'subject' => 'nullable|string|max:255',
            'attachment' => 'nullable|file|max:10240', // max 10MB attachment
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed.'
            ], 422);
        }

        // If no receiver_id is provided, try to find the receiver from the other messages in the thread
        $receiverId = $request->receiver_id;
        if (!$receiverId) {
            $otherMessage = Message::where('conversation_id', $request->conversation_id)
                ->where('sender_id', '!=', $user->id)
                ->first();
            
            if ($otherMessage) {
                $receiverId = $otherMessage->sender_id;
            } else {
                // Default to first admin in system if no receiver is active
                $adminUser = User::where('role', 'admin')->first();
                $receiverId = $adminUser ? $adminUser->id : null;
            }
        }

        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'subject' => $request->subject,
            'text' => $request->text,
            'status' => 'sent',
        ]);

        // Process attachments
        if ($request->hasFile('attachment')) {
            $url = CloudinaryService::upload($request->file('attachment'), 'chat/attachments');
            if ($url) {
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'file_path' => $url,
                    'file_name' => $request->file('attachment')->getClientOriginalName(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => $message->load('attachments'),
            'formatted' => [
                'id' => $message->id,
                'senderId' => $message->sender_id,
                'senderName' => $user->name,
                'senderRole' => $user->role,
                'text' => $message->text,
                'status' => $message->status,
                'timestamp' => $message->created_at->format('M d, Y h:i A'),
                'attachments' => $message->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'filePath' => $att->file_path,
                        'fileName' => $att->file_name,
                    ];
                }),
            ]
        ], 201);
    }
}
