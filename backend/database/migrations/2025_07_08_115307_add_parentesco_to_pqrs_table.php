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
            $table->string('parentesco')->nullable()->after('registrador_telefono');
        });
    }

    public function down()
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('parentesco');
        });
    }
};
