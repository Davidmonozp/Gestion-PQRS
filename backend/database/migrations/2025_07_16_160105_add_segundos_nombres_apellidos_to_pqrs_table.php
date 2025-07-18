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
        Schema::table('pqrs', function (Blueprint $table) {
            $table->string('segundo_nombre')->nullable()->after('nombre');
            $table->string('segundo_apellido')->nullable()->after('apellido');
            $table->string('registrador_segundo_nombre')->nullable()->after('registrador_nombre');
            $table->string('registrador_segundo_apellido')->nullable()->after('registrador_apellido');
        });
    }

    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn([
                'segundo_nombre',
                'segundo_apellido',
                'registrador_segundo_nombre',
                'registrador_segundo_apellido'
            ]);
        });
    }
};
