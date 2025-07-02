<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Pqr;
use Illuminate\Support\Facades\Log;


class PqrTiempoService
{

    public function calcularEstadoTiempo(Pqr $pqr): array
{
    $ahora = Carbon::now('America/Bogota');
    $fechaCreacion = Carbon::parse($pqr->created_at, 'America/Bogota');

    $minutosMaximos = match ($pqr->prioridad) {
        'Vital' => 24 * 60,
        'Priorizado' => 48 * 60,
        'Simple' => 72 * 60,
        default => 72 * 60,
    };

    $fechaLimite = $fechaCreacion->copy()->addMinutes($minutosMaximos);

    $estado = 'En tiempo';
    if ($pqr->respuesta_enviada) {
        $fechaRespuesta = Carbon::parse($pqr->respondido_en, 'America/Bogota');
        $estado = $fechaRespuesta->lte($fechaLimite) ? 'Cumplida a tiempo' : 'Cumplida fuera del tiempo';
    } else {
        $minutosRestantes = $ahora->diffInMinutes($fechaLimite, false);
        if ($minutosRestantes < 0) {
            $estado = 'Vencida sin respuesta';
        } elseif ($minutosRestantes <= 360) {
            $estado = 'Por vencer';
        }
    }

    return [
        'estado' => $estado,
        'fecha_limite' => $fechaLimite->toDateTimeString(),
        'ahora' => $ahora->toDateTimeString(),
    ];
}

    // public function calcularEstadoTiempo(Pqr $pqr): string
    // {
    //     $ahora = Carbon::now('America/Bogota');
    //     $fechaCreacion = Carbon::parse($pqr->created_at, 'America/Bogota');
    //     $fechaRespuesta = $pqr->respondido_en
    //         ? Carbon::parse($pqr->respondido_en, 'America/Bogota')
    //         : null;

    //     // Definir el tiempo máximo permitido según la prioridad
    //     $minutosMaximos = match ($pqr->prioridad) {
    //         'Vital' => 24 * 60,
    //         'Priorizado' => 48 * 60,
    //         'Simple' => 72 * 60,
    //         default => 72 * 60, // Asume "Simple" si no está definida
    //     };

    //     $fechaLimite = $fechaCreacion->copy()->addMinutes($minutosMaximos);

    //     // Si ya fue respondida
    //     if ($pqr->respuesta_enviada && $fechaRespuesta) {
    //         return $fechaRespuesta->lte($fechaLimite)
    //             ? 'Cumplida a tiempo'
    //             : 'Cumplida fuera del tiempo';
    //     }

    //     // Si hay respuesta final pero no se ha marcado como enviada
    //     $respuestaFinal = $pqr->respuestas()->where('es_final', true)->latest('created_at')->first();
    //     if ($respuestaFinal) {
    //         $fechaRespuesta = Carbon::parse($respuestaFinal->created_at, 'America/Bogota');
    //         return $fechaRespuesta->lte($fechaLimite)
    //             ? 'Cumplida a tiempo'
    //             : 'Cumplida fuera del tiempo';
    //     }

    //     // Todavía no ha sido respondida
    //     $minutosRestantes = $ahora->diffInMinutes($fechaLimite, false);
    //     if ($minutosRestantes < 0) {
    //         return 'Vencida sin respuesta';
    //     } elseif ($minutosRestantes <= 360) {
    //         return 'Por vencer';
    //     }

    //     return 'En tiempo';
    // }
}
