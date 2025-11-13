<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(private JwtService $jwt)
    {
    }

    public function register(Request $request)
    {
        $data = Validator::make($request->all(), [
            'name' => 'required|string|min:3',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:30',
            'citizenship_type' => 'required|in:domestic,international',
        ])->validate();

        $user = User::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => 'user',
            'citizenship_type' => $data['citizenship_type'],
        ]);

        $token = $this->jwt->generate(['sub' => $user->id, 'role' => $user->role]);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ])->validate();

        $user = User::where('email', strtolower($data['email']))->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $this->jwt->generate(['sub' => $user->id, 'role' => $user->role]);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = Validator::make($request->all(), [
            'name' => 'sometimes|string|min:3',
            'phone' => 'nullable|string|max:30',
            'citizenship_type' => 'sometimes|in:domestic,international',
            'current_password' => 'required_with:password|string',
            'password' => 'nullable|string|min:8|confirmed',
        ])->validate();

        $updates = [];

        if (array_key_exists('name', $data)) {
            $updates['name'] = $data['name'];
        }

        if (array_key_exists('phone', $data)) {
            $updates['phone'] = $data['phone'];
        }

        if (array_key_exists('citizenship_type', $data)) {
            if (
                $user->citizenship_type
                && $data['citizenship_type']
                && $data['citizenship_type'] !== $user->citizenship_type
            ) {
                return response()->json([
                    'message' => 'Jenis pengunjung tidak dapat diubah. Hubungi admin jika ada kesalahan data.',
                ], 422);
            }

            if (!$user->citizenship_type && $data['citizenship_type']) {
                $updates['citizenship_type'] = $data['citizenship_type'];
            }
        }

        if (!empty($data['password'])) {
            if (empty($data['current_password']) || !Hash::check($data['current_password'], $user->password)) {
                return response()->json(['message' => 'Password lama tidak sesuai'], 422);
            }
            $updates['password'] = Hash::make($data['password']);
        }

        if ($updates) {
            $user->update($updates);
        }

        return response()->json(['user' => $user->fresh()]);
    }
}