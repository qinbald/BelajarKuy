<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->is_active) {
            // Revoke current token if it is a real token
            $token = $request->user()->currentAccessToken();
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan oleh Administrator.',
                'errors' => ['account' => ['Akun dinonaktifkan']]
            ], 403);
        }

        return $next($request);
    }
}
