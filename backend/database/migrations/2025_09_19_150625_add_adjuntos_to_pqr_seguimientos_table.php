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
        Schema::table('pqr_seguimientos', function (Blueprint $table) {
            $table->json('adjuntos')->nullable()->after('tipo_seguimiento');
        });
    }

    public function down()
    {
        Schema::table('pqr_seguimientos', function (Blueprint $table) {
            $table->dropColumn('adjuntos');
        });
    }
};
