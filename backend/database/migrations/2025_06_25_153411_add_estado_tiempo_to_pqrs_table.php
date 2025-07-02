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
            // Usa enum para restringir a valores válidos
            $table->enum('estado_tiempo', [
                'En tiempo',
                'Por vencer',
                'Vencida sin respuesta',
                'Cumplida a tiempo',
                'Cumplida fuera del tiempo'
            ])->nullable()->after('respondido_en'); // Puedes ajustar el orden si lo deseas
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('estado_tiempo');
        });
    }
};
