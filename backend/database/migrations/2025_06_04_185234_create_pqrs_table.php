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
        Schema::create('pqrs', function (Blueprint $table) {
            $table->id();

            // Datos del solicitante (la persona por la que se hace la PQRS)
            $table->string('nombre');
            $table->string('apellido');
            $table->string('documento_tipo');
            $table->string('documento_numero');
            $table->string('correo');
            $table->string('telefono')->nullable();
            $table->string('sede');
            $table->string('servicio_prestado');
            $table->string('eps');
            $table->string('tipo_solicitud');
            $table->text('descripcion');
            $table->json('archivo')->nullable();  

            // NUEVOS CAMPOS: Datos del registrador
            $table->boolean('registra_otro')->default(false);
            $table->string('registrador_nombre')->nullable();
            $table->string('registrador_apellido')->nullable();
            $table->string('registrador_documento_tipo')->nullable();
            $table->string('registrador_documento_numero')->nullable();
            $table->string('registrador_correo')->nullable();
            $table->string('registrador_telefono')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pqrs');
    }
};
