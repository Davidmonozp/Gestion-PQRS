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
        Schema::table('pqr_seguimientos', function (Illuminate\Database\Schema\Blueprint $table) {
            $table->string('tipo_seguimiento')->nullable()->after('descripcion');
        });
    }

    public function down()
    {
        Schema::table('pqr_seguimientos', function (Illuminate\Database\Schema\Blueprint $table) {
            $table->dropColumn('tipo_seguimiento');
        });
    }
};
