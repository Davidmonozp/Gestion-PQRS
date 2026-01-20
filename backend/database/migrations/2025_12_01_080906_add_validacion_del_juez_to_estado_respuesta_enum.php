<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE pqrs 
            MODIFY COLUMN estado_respuesta 
            ENUM(
                'Radicado',
                'Asignado',
                'En proceso',
                'Requiere respuesta del usuario',
                'Cerrado',
                'Validacion del juez'
            )
            DEFAULT 'Radicado'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE pqrs 
            MODIFY COLUMN estado_respuesta 
            ENUM(
                'Radicado',
                'Asignado',
                'En proceso',
                'Requiere respuesta del usuario',
                'Cerrado',
                'Validacion del juez'
            )
            DEFAULT 'Radicado'
        ");
    }
};
