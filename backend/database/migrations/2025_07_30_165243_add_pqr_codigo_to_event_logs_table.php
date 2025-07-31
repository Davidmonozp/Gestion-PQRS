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
        Schema::table('event_logs', function (Blueprint $table) {
            $table->string('pqr_codigo')->nullable()->after('pqr_id');
        });
    }

    public function down()
    {
        Schema::table('event_logs', function (Blueprint $table) {
            $table->dropColumn('pqr_codigo');
        });
    }
};
