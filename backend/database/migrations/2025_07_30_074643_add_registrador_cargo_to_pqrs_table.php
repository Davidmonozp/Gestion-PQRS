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
            $table->string('registrador_cargo', 100)
                ->nullable()
                ->after('registrador_telefono');
            // Ajusta el `after` según la posición que quieras
        });
    }

    public function down(): void
    {
        Schema::table('pqrs', function (Blueprint $table) {
            $table->dropColumn('registrador_cargo');
        });
    }
};
