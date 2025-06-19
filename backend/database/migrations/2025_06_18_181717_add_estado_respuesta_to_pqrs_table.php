<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->enum('estado_respuesta', ['Pendiente', 'Preliminar', 'Respondida'])->default('Pendiente');
            $table->boolean('respuesta_enviada')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('estado_respuesta');
            $table->dropColumn('respuesta_enviada');
        });
    }
};
