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
        Schema::create('clasificacion_pqr', function (Blueprint $table) {
            $table->foreignId('pqr_id')->constrained('pqrs')->onDelete('cascade');
            $table->foreignId('clasificacion_id')->constrained('clasificaciones')->onDelete('cascade'); // <-- Asegúrate que sea 'clasificaciones' (plural)
            $table->timestamps(); // Añadir timestamps es buena práctica para la tabla pivote
            $table->primary(['pqr_id', 'clasificacion_id']); // <-- ¡AÑADE ESTO! Clave primaria compuesta
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clasificacion_pqr');
    }
};
