<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Missing or invalid token format.'
            ], 401);
        }

        $token = substr($header, 7);
        $tokenHashed = hash('sha256', $token);

        $user = User::where('api_token_hashed', $tokenHashed)
            ->where('status', 'active')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Token is expired, invalid, or user account is deactivated.'
            ], 401);
        }

        // Authenticate the user for the request
        Auth::login($user);

        return $next($request);
    }
}
