<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Str;
use Throwable;

class JwtService
{
    public function generate(array $claims, ?int $ttlMinutes = null): string
    {
        $issuedAt = now()->timestamp;
        $expires = $issuedAt + 60 * ($ttlMinutes ?? (int)config('jwt.exp_minutes', 120));
        $payload = array_merge($claims, [
            'iat' => $issuedAt,
            'exp' => $expires,
            'iss' => config('app.url'),
            'jti' => (string) Str::uuid(),
        ]);

        return JWT::encode($payload, config('jwt.secret'), 'HS256');
    }

    public function decode(?string $token): ?array
    {
        if (!$token) {
            return null;
        }
        try {
            $decoded = JWT::decode($token, new Key(config('jwt.secret'), 'HS256'));
            return (array) $decoded;
        } catch (Throwable $e) {
            return null;
        }
    }
}
