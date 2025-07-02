<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePqrConsecutivosTable extends Migration
{
    public function up()
    {
        Schema::create('pqr_consecutivos', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_solicitud'); // Petición, Queja, etc.
            $table->unsignedBigInteger('ultimo_numero')->default(0); // Último número usado
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pqr_consecutivos');
    }
}
