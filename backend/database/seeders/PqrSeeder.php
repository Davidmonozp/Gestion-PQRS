<?php

namespace Database\Seeders;

use App\Models\Pqr;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PqrSeeder extends Seeder
{
    public function run(): void
    {
        Storage::makeDirectory('public/pqrs_files');

        $prefixes = [
            'Petición'      => 'PT',
            'Queja'         => 'QJ',
            'Reclamo'       => 'RE',
            'Solicitud'    => 'SO', 
            'Felicitación'  => 'FE',
        ];

        for ($i = 0; $i < 10; $i++) {
            $tipoSolicitud = fake()->randomElement(array_keys($prefixes));
            $documentoNumero = fake()->unique()->numerify('##########');
            $prefijo = $prefixes[$tipoSolicitud] ?? 'XX';

            // Contamos los registros existentes de este tipo
            $contador = Pqr::where('tipo_solicitud', $tipoSolicitud)->count() + 1;

            // Formateamos el número
            $consecutivo = str_pad($contador, 7, '0', STR_PAD_LEFT);

            // Generamos el código final
            $codigo = "{$prefijo}_{$consecutivo}_{$documentoNumero}";

            Pqr::create([
                'pqr_codigo'         => $codigo,
                'nombre'             => fake()->firstName(),
                'apellido'           => fake()->lastName(),
                'documento_tipo'     => fake()->randomElement(['CC', 'CE', 'TI']),
                'documento_numero'   => $documentoNumero,
                'correo'             => fake()->unique()->safeEmail(),
                'telefono'           => fake()->phoneNumber(),
                'sede'               => fake()->randomElement(['Bogota-Sur-Occidente-Rehabilitación', 'Bogota-Sur-Occidente-Hidroterapia', 'Bogota-Norte', 'Bogota-Centro', 'Ibague', 'Florencia']),
                'servicio_prestado'  => fake()->randomElement(['Hidroterapia', 'Fisiatría', 'Fonoaudiología']),
                'eps'                => fake()->randomElement(['Sanitas', 'Compensar', 'Famisanar', 'Cafam', 'Sura', 'Nueva EPS']),
                'tipo_solicitud'     => $tipoSolicitud,
                'descripcion'        => fake()->paragraph(),
                'archivo'            => null,
            ]);
        }
    }
}
