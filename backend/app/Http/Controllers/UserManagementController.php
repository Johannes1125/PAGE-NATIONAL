<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserManagementController extends Controller
{
    /**
     * List all registered users.
     */
    public function index(Request $request)
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Update user details (Role, Status, University, Position).
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'role' => 'nullable|string|in:admin,organization,member,reviewer',
            'status' => 'nullable|string|in:active,inactive',
            'university' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation error.'
            ], 422);
        }

        $changes = [];
        if ($request->has('role') && $request->role !== $user->role) {
            $changes[] = "role from '{$user->role}' to '{$request->role}'";
            $user->role = $request->role;
        }

        if ($request->has('status') && $request->status !== $user->status) {
            $changes[] = "status from '{$user->status}' to '{$request->status}'";
            $user->status = $request->status;
            
            // Force logout if status set to inactive
            if ($request->status === 'inactive') {
                $user->api_token_hashed = null;
            }
        }

        if ($request->has('university')) {
            $user->university = $request->university;
        }

        if ($request->has('position')) {
            $user->position = $request->position;
        }

        $user->save();

        if (count($changes) > 0) {
            $logString = implode(', ', $changes);
            UserActivity::create([
                'user_id' => Auth::id(),
                'action' => "Modified user #{$user->id} ({$user->name}) attributes: {$logString}.",
                'ip_address' => $request->ip(),
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'User account updated successfully.'
        ]);
    }

    /**
     * Deactivate a user.
     */
    public function deactivate(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $user->status = 'inactive';
        $user->api_token_hashed = null; // Clear active token
        $user->save();

        // Audit Trail log
        UserActivity::create([
            'user_id' => Auth::id(),
            'action' => "Deactivated user account #{$user->id} ({$user->name}).",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} has been deactivated successfully."
        ]);
    }

    /**
     * Retrieve audit activities for a specific user.
     */
    public function activities(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $activities = UserActivity::where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'action' => $act->action,
                    'ipAddress' => $act->ip_address,
                    'timestamp' => $act->created_at->toDateTimeString(),
                    'timeDiff' => $act->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'userName' => $user->name,
            'activities' => $activities
        ]);
    }
}
