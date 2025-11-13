<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    public function __construct(private JwtService $jwt)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);
        $payload = $this->jwt->decode($token);

        if (!$payload || empty($payload['sub'])) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        $user = User::find($payload['sub']);
        if (!$user) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        $request->attributes->set('token_payload', $payload);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return trim(substr($header, 7));
        }
        return $request->bearerToken();
    }
}
