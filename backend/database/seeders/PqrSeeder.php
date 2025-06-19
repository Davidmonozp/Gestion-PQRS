<?php

namespace Database\Seeders;

use App\Models\Pqr;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PqrSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Storage::makeDirectory('public/pqrs_files');

        for ($i = 0; $i < 10; $i++) {
            Pqr::create([
                'nombre'             => fake()->firstName(),
                'apellido'           => fake()->lastName(),
                'documento_tipo'     => fake()->randomElement(['CC', 'CE', 'TI']),
                'documento_numero'   => fake()->unique()->numerify('##########'),
                'correo'             => fake()->unique()->safeEmail(),
                'telefono'           => fake()->phoneNumber(),
                'sede'               => fake()->randomElement(['Sede A', 'Sede B']),
                'servicio_prestado'  => fake()->randomElement(['Consulta médica', 'Laboratorio', 'Urgencias']),
                'eps'                => fake()->company(),
                'tipo_solicitud'     => fake()->randomElement(['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación']),
                'descripcion'        => fake()->paragraph(),
                'archivo'            => null, // O simular archivo si deseas
            ]);
        }
    }
}
