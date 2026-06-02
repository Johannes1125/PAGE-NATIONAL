<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Unified Login endpoint for Admins, Organizations, and Members.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation error'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address or password.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This account has been deactivated. Please contact the PAGE administration.'
            ], 403);
        }

        // Generate cryptographically strong random token
        $plainToken = bin2hex(random_bytes(40));
        $hashedToken = hash('sha256', $plainToken);

        // Store hashed token in DB (standard security practice)
        $user->api_token_hashed = $hashedToken;
        $user->save();

        // Audit Trail entry
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'Logged in successfully.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'token' => $plainToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'university' => $user->university,
                'position' => $user->position,
                'status' => $user->status,
            ],
            'message' => 'Login successful'
        ]);
    }

    /**
     * Logout endpoint to clear the session token.
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Log logout action
            UserActivity::create([
                'user_id' => $user->id,
                'action' => 'Logged out.',
                'ip_address' => $request->ip(),
            ]);

            $user->api_token_hashed = null;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Fetch current authenticated user profile.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'university' => $user->university,
                'position' => $user->position,
                'status' => $user->status,
            ]
        ]);
    }

    /**
     * Public Registration Endpoint.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:member,organization,reviewer',
            'university' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation error'
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'university' => $request->university,
            'position' => $request->position,
            'status' => 'active',
        ]);

        // Audit Trail entry
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'Registered a new account.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'university' => $user->university,
                'position' => $user->position,
                'status' => $user->status,
            ],
            'message' => 'Registration successful! You can now log in.'
        ], 201);
    }

    /**
     * Simulated Forgot Password Request Endpoint.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation error'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address.'
            ], 404);
        }

        $tempToken = bin2hex(random_bytes(16));

        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'Requested password reset link.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'A password reset link has been successfully simulated and dispatched!',
            'reset_token' => $tempToken,
        ]);
    }

    /**
     * Simulated Password Reset Action.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation error'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'Reset password successfully.',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your password has been successfully reset. You can now log in with your new password!'
        ]);
    }
}
