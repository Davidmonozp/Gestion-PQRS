<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pqr_encuestas', function (Blueprint $table) {
            $table->enum('respuesta_satisfaccion_final', ['Si', 'Parcialmente', 'No'])->nullable()
                  ->after('calificacion'); 
        });
    }

    public function down(): void
    {
        Schema::table('pqr_encuestas', function (Blueprint $table) {
            $table->dropColumn('respuesta_satisfaccion_final');
        });
    }
};
