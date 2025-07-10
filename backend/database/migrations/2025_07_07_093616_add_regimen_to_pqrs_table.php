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
            $table->string('regimen')->default('No especificado')->after('eps');
        });
    }

    public function down()
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('regimen');
        });
    }
};
