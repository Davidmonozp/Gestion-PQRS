<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePqrReembolsosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pqr_reembolsos', function (Blueprint $table) {
            $table->id();

            // Relación con la PQR
            $table->foreignId('pqr_id')
                ->constrained('pqrs')
                ->onDelete('cascade');

            // Relación con el usuario que aprobó/desaprobó (puede quedar null si aún no se aprueba)
            $table->foreignId('aprobado_por')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // Estado del reembolso
            $table->enum('estado', ['Pendiente', 'Aprobado', 'Desaprobado'])
                ->default('Pendiente');

            // Comentario opcional
            $table->text('comentario')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pqr_reembolsos');
    }
}
