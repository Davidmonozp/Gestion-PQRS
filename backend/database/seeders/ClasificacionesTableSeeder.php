<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents; // Puedes eliminar esta línea si no la usas
use Illuminate\Database\Seeder;
// use Illuminate\Support\Facades\DB; // Ya no necesitas importar DB si usas el modelo directamente
use App\Models\Clasificacion; // <--- ¡¡¡IMPORTA TU MODELO Clasificacion AQUÍ!!!

class ClasificacionesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clasificaciones = [
            'Agendamiento',
            'Atención de profesional',
            'Atencion linea de frente',
            'Callcenter',
            'Cancelación- Reprogramación',
            'Exoneración de multa',
            'Información',
            'Infraestructura',
            'Administrativo de sede',
            'Modelo de atención',
            'Orden y aseo',
            'Reembolsos',
            'Solicitud de HC',
            'Eventos de seguridad del paciente',
        ];

        foreach ($clasificaciones as $clasificacionNombre) { // Cambié la variable a $clasificacionNombre para claridad
            Clasificacion::firstOrCreate( // <--- ¡¡¡USA TU MODELO Clasificacion AQUÍ!!!
                ['nombre' => $clasificacionNombre]
            );
            // created_at y updated_at se rellenarán automáticamente por Eloquent.
        }
    }
}