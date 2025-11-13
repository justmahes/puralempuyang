<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WeatherController extends Controller
{
    private const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
    private const DEFAULT_LAT = -8.39175697195813;
    private const DEFAULT_LON = 115.63140756256088;

    public function show(Request $request)
    {
        $data = Validator::make($request->all(), [
            'date' => 'nullable|date',
        ])->validate();

        $date = $data['date'] ?? now()->toDateString();

        $cacheKey = sprintf('weather:%s', $date);
        $payload = Cache::remember($cacheKey, now()->addMinutes(15), function () use ($date) {
            $query = [
                'latitude' => self::DEFAULT_LAT,
                'longitude' => self::DEFAULT_LON,
                'daily' => 'temperature_2m_max,precipitation_probability_max,sunset,sunrise,uv_index_max',
                'hourly' => 'temperature_2m,precipitation_probability,cloud_cover,rain',
                'current' => 'is_day',
                'timezone' => 'Asia/Singapore',
                'start_date' => $date,
                'end_date' => $date,
            ];

            $response = Http::timeout(8)->acceptJson()->get(self::BASE_URL, $query);

            if ($response->failed()) {
                Log::warning('Weather API failed', ['status' => $response->status(), 'body' => $response->body()]);
                return null;
            }

            return $response->json();
        });

        if (!$payload) {
            return response()->json(['message' => 'Cuaca belum tersedia'], 503);
        }

        return response()->json([
            'data' => [
                'date' => $date,
                'daily' => $payload['daily'] ?? [],
                'hourly' => $payload['hourly'] ?? [],
                'current' => $payload['current'] ?? [],
            ],
        ]);
    }
}
