<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->enum('estado_respuesta', ['Radicado', 'Asignado', 'En proceso', 'Requiere respuesta del usuario', 'Cerrado'])->default('Radicado');
            $table->boolean('respuesta_enviada')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('estado_respuesta');
            $table->dropColumn('respuesta_enviada');
        });
    }
};
