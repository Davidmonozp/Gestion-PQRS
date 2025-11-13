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
            // Se añade el campo para la llave foránea que apunta a sí misma
            $table->unsignedBigInteger('id_pqrs_maestra')->nullable()->after('id')->comment('ID de la PQR principal a la que está asociada');

            // Definir la llave foránea a la misma tabla
            $table->foreign('id_pqrs_maestra')
                ->references('id')
                ->on('pqrs')
                ->onDelete('set null'); // Si la maestra se elimina, este campo se pone a NULL
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            // Es crucial eliminar primero la restricción de la llave foránea
            $table->dropForeign(['id_pqrs_maestra']);
            $table->dropColumn('id_pqrs_maestra');
        });
    }
};
