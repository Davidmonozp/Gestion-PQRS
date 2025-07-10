<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

// Comando personalizado para actualizar estados de PQRS
Artisan::command('pqrs:actualizar-tiempos', function () {
    $this->info('Actualizando estados de tiempo de PQRS...');

    $tiempoService = new \App\Services\PqrTiempoService();

    $pqrs = \App\Models\Pqr::where('respuesta_enviada', 0)->get();

    $actualizadas = 0;

    foreach ($pqrs as $pqr) {
        $resultado = $tiempoService->calcularEstadoTiempo($pqr);
        $nuevoEstado = $resultado['estado'];

        if ($pqr->estado_tiempo !== $nuevoEstado) {
            $pqr->estado_tiempo = $nuevoEstado;
            $pqr->save();
            $actualizadas++;
        }
    }

    $this->info("PQRS actualizadas: $actualizadas");
})->describe('Actualiza automáticamente el estado de tiempo de las PQRS sin respuesta');

// Aquí definimos la tarea programada:
app(Schedule::class)->command('pqrs:actualizar-tiempos')->everyMinute();
