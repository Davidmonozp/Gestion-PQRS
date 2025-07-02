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
        Schema::create('plantillas_respuesta', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');    // Nombre para identificar la plantilla
        $table->text('contenido');   // Texto base de la plantilla (con variables si quieres)
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plantillas_respuesta');
    }
};
