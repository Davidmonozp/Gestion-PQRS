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
       Schema::create('respuestas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pqrs_id')->constrained()->onDelete('cascade'); // FK a pqrs
            $table->foreignId('user_id')->constrained(); // FK a users (gestor que responde)
            $table->text('contenido');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respuestas');
    }
};
