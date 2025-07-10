<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pqr;
use App\Services\PqrTiempoService;
use Illuminate\Support\Facades\Log;

class ActualizarEstadoTiempoPqrs extends Command
{
    protected $signature = 'pqrs:actualizar-tiempos';
    protected $description = 'Actualiza automáticamente el estado de tiempo (En tiempo, Por vencer, Vencida sin respuesta) de las PQRS sin respuesta';

    public function handle()
    {
        Log::info("⏰ Cron ejecutado para actualizar PQRS: " . now());
        $this->info("Actualizando estados de tiempo de PQRS...");

        $tiempoService = new PqrTiempoService();

        $pqrs = Pqr::where('respuesta_enviada', 0)->get();

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
    }
}
