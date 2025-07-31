<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SedeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sedes = [
            ['name' => 'Bogota-Sur-Occidente-Rehabilitación'],
            ['name' => 'Bogota-Sur-Occidente-Hidroterapia'],
            ['name' => 'Bogota-Norte'],
            ['name' => 'Bogota-Centro'],
            ['name' => 'Chia'],
            ['name' => 'Florencia'],
            ['name' => 'Ibague'],
        ];

        foreach ($sedes as $sede) {
            DB::table('sedes')->insertOrIgnore($sede); 
        }
    }
}
