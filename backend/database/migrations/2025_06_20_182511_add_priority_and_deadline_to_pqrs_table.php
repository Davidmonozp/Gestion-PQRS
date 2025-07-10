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
            $table->enum('prioridad', ['Vital', 'Priorizado', 'Simple', 'Solicitud'])->nullable()->after('asignado_a');
            $table->timestamp('deadline_interno')->nullable()->after('prioridad');
            $table->timestamp('deadline_ciudadano')->nullable()->after('deadline_interno');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('prioridad');
            $table->dropColumn('deadline_interno');
            $table->dropColumn('deadline_ciudadano');
        });
    }
};
