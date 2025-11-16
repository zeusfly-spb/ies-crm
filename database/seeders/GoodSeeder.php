<?php

namespace Database\Seeders;

use App\Models\Good;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GoodSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $goods = [
            [
                'name' => 'Ноутбук Dell XPS 15',
                'comment' => 'Мощный ноутбук для работы и игр, 16GB RAM, SSD 512GB',
                'count' => 5,
            ],
            [
                'name' => 'Смартфон iPhone 15 Pro',
                'comment' => 'Флагманский смартфон Apple, 256GB памяти',
                'count' => 12,
            ],
            [
                'name' => 'Наушники Sony WH-1000XM5',
                'comment' => 'Беспроводные наушники с активным шумоподавлением',
                'count' => 8,
            ],
            [
                'name' => 'Планшет iPad Air',
                'comment' => 'Планшет Apple с дисплеем 10.9 дюймов, 64GB',
                'count' => 6,
            ],
            [
                'name' => 'Клавиатура Logitech MX Keys',
                'comment' => 'Беспроводная механическая клавиатура для профессионалов',
                'count' => 15,
            ],
            [
                'name' => 'Мышь Logitech MX Master 3',
                'comment' => 'Эргономичная беспроводная мышь с точным трекингом',
                'count' => 20,
            ],
            [
                'name' => 'Монитор LG UltraWide 34"',
                'comment' => 'Широкоформатный монитор 3440x1440, IPS панель',
                'count' => 4,
            ],
            [
                'name' => 'Веб-камера Logitech C920',
                'comment' => 'Full HD веб-камера для видеоконференций',
                'count' => 10,
            ],
        ];

        foreach ($goods as $good) {
            Good::create($good);
        }
    }
}

