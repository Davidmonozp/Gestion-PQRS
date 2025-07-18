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

        // Esta línea ya asegura que la base sea fecha_inicio_real o created_at
        $base = $pqr->fecha_inicio_real ?? $pqr->created_at;

        $fechaLimite = Carbon::parse($base, 'America/Bogota')->addMinutes(
            match ($pqr->prioridad) {
                'Vital'      => 6 * 60,   
                'Priorizado' => 24 * 60,   
                'Simple'     => 24 * 60,  
                'Solicitud'  => 24 * 60,   
                default      => 24 * 60,   
            }
        );

        $estado = 'En tiempo';
        $tiempoCiudadanoDisplay = ''; // Aquí guardaremos la cadena del "contador"

        if ($pqr->respuesta_enviada) {
            $fechaRespuesta = Carbon::parse($pqr->respondido_en, 'America/Bogota');

            if ($fechaRespuesta->lte($fechaLimite)) {
                $estado = 'Cumplida a tiempo';
                // Si se cumplió a tiempo, el "contador" mostraría 0s o lo que quedaba al momento de responder
                $tiempoCiudadanoDisplay = '0s'; // Opcional: podrías mostrar el tiempo que quedaba $this->formatTimeDifference($fechaRespuesta->diff($fechaLimite))
            } else {
                $estado = 'Cumplida fuera del tiempo';
                // Si se cumplió fuera de tiempo, mostramos cuánto tiempo excedió
                $diff = $fechaLimite->diff($fechaRespuesta); // Diferencia absoluta desde el límite hasta la respuesta
                $tiempoCiudadanoDisplay = 'Expirado hace ' . $this->formatTimeDifference($diff);
            }

        } else {
            // La PQR aún no ha sido respondida
            $totalMinutesDiff = $ahora->diffInMinutes($fechaLimite, false); // Diferencia con signo: negativo si ya expiró

            if ($totalMinutesDiff < 0) {
                // El plazo ya expiró sin respuesta
                $estado = 'Vencida sin respuesta';
                $diff = $fechaLimite->diff($ahora); // Diferencia absoluta desde el límite hasta ahora
                $tiempoCiudadanoDisplay = 'Expirado hace ' . $this->formatTimeDifference($diff);
            } elseif ($totalMinutesDiff <= 360) { // 360 minutos = 6 horas (Próxima a vencer)
                $estado = 'Por vencer';
                $diff = $ahora->diff($fechaLimite); // Diferencia absoluta desde ahora hasta el límite
                $tiempoCiudadanoDisplay = 'Quedan ' . $this->formatTimeDifference($diff);
            } else {
                // Todavía en tiempo
                $estado = 'En tiempo';
                $diff = $ahora->diff($fechaLimite); // Diferencia absoluta desde ahora hasta el límite
                $tiempoCiudadanoDisplay = 'Quedan ' . $this->formatTimeDifference($diff);
            }
        }

        return [
            'estado' => $estado,
            'fecha_limite' => $fechaLimite->toDateTimeString(),
            'ahora' => $ahora->toDateTimeString(),
            'tiempo_ciudadano_formateado' => $tiempoCiudadanoDisplay, // <-- Este es el "contador" formateado
        ];
    }

     private function formatTimeDifference(\DateInterval $diff): string
    {
        $parts = [];

        // Asegurarse de que el formato sea similar a "14d 21h 47m 51s"
        if ($diff->y > 0) {
            $parts[] = $diff->y . 'a'; // Años
        }
        if ($diff->m > 0) {
            $parts[] = $diff->m . 'M'; // Meses
        }
        if ($diff->days > 0) {
            $parts[] = $diff->days . 'd'; // Días
        }
        // Incluir horas, minutos, segundos solo si son > 0 O si ya se agregaron partes mayores
        // para asegurar que siempre se muestren las unidades inferiores si las superiores son cero.
        if ($diff->h > 0 || (!empty($parts) && ($diff->i > 0 || $diff->s > 0))) {
            $parts[] = $diff->h . 'h';
        }
        if ($diff->i > 0 || (!empty($parts) && $diff->s > 0)) {
            $parts[] = $diff->i . 'm';
        }
        // Siempre incluir segundos si no hay otras partes o si es el único valor significativo.
        if ($diff->s > 0 || empty($parts)) {
            $parts[] = $diff->s . 's';
        }

        // Caso especial si la diferencia es exactamente 0
        if (empty($parts)) {
            return '0s';
        }

        return implode(' ', $parts);
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
