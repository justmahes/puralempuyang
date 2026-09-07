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
    /** Jumlah hari ke depan yang dibuatkan slot kunjungan. */
    private const SLOT_DAYS = 7;

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
                'key' => 'gate_of_heaven',
                'name' => 'Gate of Heaven Sunrise',
                'description' => 'Sesi ikonik di Candi Bentar saat matahari terbit, termasuk nomor antre foto prioritas',
                'capacity' => 50,
                'prices' => [
                    'domestic' => 45000,
                    'international' => 85000,
                ],
                'slots' => [
                    ['start' => '05:00:00', 'end' => '06:30:00', 'quota' => 50],
                    ['start' => '06:30:00', 'end' => '08:00:00', 'quota' => 50],
                ],
            ],
            [
                'key' => 'pilgrimage',
                'name' => 'Lempuyang Luhur Pilgrimage',
                'description' => 'Pendakian ke pura puncak bersama pemandu spiritual, termasuk persembahyangan',
                'capacity' => 40,
                'prices' => [
                    'domestic' => 75000,
                    'international' => 150000,
                ],
                'slots' => [
                    ['start' => '06:00:00', 'end' => '12:00:00', 'quota' => 40],
                ],
            ],
            [
                'key' => 'twilight',
                'name' => 'Twilight Blessing',
                'description' => 'Persembahyangan senja di pelataran utama dengan panorama Gunung Agung',
                'capacity' => 40,
                'prices' => [
                    'domestic' => 35000,
                    'international' => 65000,
                ],
                'slots' => [
                    ['start' => '18:00:00', 'end' => '19:30:00', 'quota' => 40],
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
                    'experience_code' => $experience['key'],
                    'description' => $experience['description'],
                    'price' => $price,
                    'capacity' => $experience['capacity'],
                    'is_active' => true,
                ]);
            }
        }

        // Satu sesi = satu slot dengan satu kuota bersama. Tarif domestik dipakai
        // sebagai tipe kanonik; tarif mancanegara menempel lewat experience_code.
        foreach (range(1, self::SLOT_DAYS) as $dayOffset) {
            $date = Carbon::now()->addDays($dayOffset)->toDateString();

            foreach ($experiences as $experience) {
                $canonicalType = $tickets[$experience['key']]['domestic']
                    ?? reset($tickets[$experience['key']]);

                foreach ($experience['slots'] as $slot) {
                    $visitSlot = VisitSlot::query()->firstOrNew([
                        'ticket_type_id' => $canonicalType->id,
                        'visit_date' => $date,
                        'start_time' => $slot['start'],
                        'end_time' => $slot['end'],
                    ]);

                    // Kuota sisa hanya diisi saat slot baru dibuat, supaya
                    // menjalankan seeder ulang tidak menghapus pemesanan.
                    if (!$visitSlot->exists) {
                        $visitSlot->quota_remaining = $slot['quota'];
                    }
                    $visitSlot->quota_total = $slot['quota'];
                    $visitSlot->save();
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
