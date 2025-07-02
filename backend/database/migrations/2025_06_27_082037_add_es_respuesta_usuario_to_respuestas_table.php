<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('respuestas', function (Blueprint $table) {
            $table->boolean('es_respuesta_usuario')->default(false)->after('contenido');
        });
    }

    public function down()
    {
        Schema::table('respuestas', function (Blueprint $table) {
            $table->dropColumn('es_respuesta_usuario');
        });
    }
};
