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
        Schema::table('pqrs', function (Blueprint $table) {
            // Se usa boolean con valor por defecto 0 (false) para indicar que es "individual"
            $table->boolean('es_asociada')->default(false)->after('id_pqrs_maestra');
        });
    }

    public function down()
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('es_asociada');
        });
    }
};
