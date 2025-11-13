<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        if (!empty($roles) && !in_array($user->role, $roles, true)) {
            return new JsonResponse(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
