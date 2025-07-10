<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        \App\Console\Commands\ActualizarEstadoTiempoPqrs::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('pqrs:actualizar-tiempos')->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        // require base_path('routes/console.php');
    }
}
