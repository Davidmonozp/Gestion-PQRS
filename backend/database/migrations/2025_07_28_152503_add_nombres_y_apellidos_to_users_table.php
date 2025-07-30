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
        Schema::table('users', function (Blueprint $table) {
            $table->string('segundo_nombre')->nullable()->after('name');
            $table->string('primer_apellido')->after('segundo_nombre');
            $table->string('segundo_apellido')->nullable()->after('primer_apellido');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['segundo_nombre', 'primer_apellido', 'segundo_apellido']);
        });
    }
};
