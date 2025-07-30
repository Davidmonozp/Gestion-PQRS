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
            ['name' => 'Bogota-Norte-Hidroterapia'],
            ['name' => 'Bogota-Centro-Hidroterapia'],
            ['name' => 'Chia-Rehabilitacion'],
            ['name' => 'Florencia-Hidroterapia-Rehabilitacion'],
            ['name' => 'Ibague-Hidroterapia-Rehabilitacion'],
        ];

        foreach ($sedes as $sede) {
            DB::table('sedes')->insertOrIgnore($sede); 
        }
    }
}
