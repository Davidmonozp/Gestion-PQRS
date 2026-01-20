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
        Schema::create('pqr_encuestas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pqr_id');
            $table->string('token')->unique();
            $table->boolean('respondida')->default(false);
            $table->timestamp('respondida_en')->nullable();
            $table->timestamps();

            $table->foreign('pqr_id')->references('id')->on('pqrs')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pqr_encuestas');
    }
};
