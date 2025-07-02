<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE pqrs MODIFY estado_respuesta ENUM(
            'Radicado',
            'Asignado',
            'En proceso',
            'Requiere respuesta del usuario',
            'Respuesta del usuario registrada',
            'Cerrado'
        ) DEFAULT 'Radicado'");
    }

    public function down(): void
    {
        // Revertimos a los valores anteriores
        DB::statement("ALTER TABLE pqrs MODIFY estado_respuesta ENUM(
            'Radicado',
            'Asignado',
            'En proceso',
            'Requiere respuesta del usuario',
            'Cerrado'
        ) DEFAULT 'Radicado'");
    }
};
