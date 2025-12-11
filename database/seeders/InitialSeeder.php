<?php

namespace Database\Seeders;

use App\Models\TicketType;
use App\Models\User;
use App\Models\VisitSlot;
use App\Models\PhotoPoint;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@puralempuyang.com'],
            [
                'name' => 'Super Admin',
                'role' => 'admin',
                'citizenship_type' => 'domestic',
                'password' => Hash::make('admin123'),
            ]
        );

        // Default operator account
        User::query()->updateOrCreate(
            ['email' => 'operator@puralempuyang.com'],
            [
                'name' => 'Petugas Gerbang',
                'role' => 'operator',
                'citizenship_type' => 'domestic',
                'password' => Hash::make('operator123'),
            ]
        );

        $experiences = [
            [
                'key' => 'sunrise',
                'name' => 'Sunrise Spiritual Journey',
                'description' => 'Pengalaman pagi hari dengan pemandu lokal',
                'capacity' => 80,
                'prices' => [
                    'domestic' => 30000,
                    'international' => 55000,
                ],
                'slots' => [
                    ['start' => '05:30:00', 'end' => '07:00:00', 'quota' => 80],
                    ['start' => '07:00:00', 'end' => '08:30:00', 'quota' => 80],
                ],
            ],
            [
                'key' => 'golden',
                'name' => 'Golden Hour Experience',
                'description' => 'Sesi sore hari dengan panorama matahari terbenam',
                'capacity' => 60,
                'prices' => [
                    'domestic' => 30000,
                    'international' => 55000,
                ],
                'slots' => [
                    ['start' => '16:30:00', 'end' => '18:00:00', 'quota' => 60],
                ],
            ],
        ];

        $tickets = [];
        foreach ($experiences as $experience) {
            foreach ($experience['prices'] as $category => $price) {
                $tickets[$experience['key']][$category] = TicketType::query()->updateOrCreate([
                    'name' => $experience['name'],
                    'category' => $category,
                ], [
                    'description' => $experience['description'],
                    'price' => $price,
                    'capacity' => $experience['capacity'],
                    'is_active' => true,
                ]);
            }
        }

        $baseDate = Carbon::now()->addDay();
        foreach ($experiences as $experience) {
            foreach ($experience['slots'] as $slot) {
                foreach ($experience['prices'] as $category => $_) {
                    $ticketType = $tickets[$experience['key']][$category];
                    VisitSlot::query()->updateOrCreate([
                        'ticket_type_id' => $ticketType->id,
                        'visit_date' => $baseDate->toDateString(),
                        'start_time' => $slot['start'],
                        'end_time' => $slot['end'],
                    ], [
                        'quota_total' => $slot['quota'],
                        'quota_remaining' => $slot['quota'],
                    ]);
                }
            }
        }

        // Photo points default
        PhotoPoint::query()->updateOrCreate([
            'name' => 'Gate of Heaven',
        ], [
            'location' => 'Pura Lempuyang - Spot Utama',
            'is_active' => true,
        ]);
    }
}
