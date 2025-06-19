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
            $table->enum('atributo_calidad', [
                'Accesibilidad',
                'Continuidad',
                'Oportunidad',
                'Pertinencia',
                'Satisfacción del usuario',
                'Seguridad'
            ])->nullable()->after('descripcion');

            $table->enum('fuente', [
                'Formulario de la web',
                'correo atención al usuario',
                'Correo de Agendamiento NAC',
                'Encuesta de satisfacción IPS',
                'callcenter',
                'Presencial'
            ])->nullable()->after('atributo_calidad');

            $table->unsignedBigInteger('asignado_a')->nullable()->after('fuente');
            $table->foreign('asignado_a')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropForeign(['asignado_a']);
            $table->dropColumn(['atributo_calidad', 'fuente', 'asignado_a']);
        });
    }
};
