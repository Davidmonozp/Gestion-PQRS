<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
    {
        DB::statement("ALTER TABLE pqrs MODIFY prioridad ENUM('Vital', 'Priorizado', 'Simple', 'Solicitud') NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE pqrs MODIFY prioridad ENUM('Vital', 'Priorizado', 'Simple') NULL");
    }
};
