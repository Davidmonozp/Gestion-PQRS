<?php

namespace App\Observers;

use App\Models\Respuesta;
use App\Models\EventLog;
use Illuminate\Support\Facades\Auth;

class RespuestaObserver
{
    /**
     * Evento: cuando se actualiza una respuesta
     */
    public function updated(Respuesta $respuesta)
    {
        // Inicializamos las variables
        $tipoCambio = null;
        $descripcion = null;

        // Detectar si cambiaron los adjuntos
        if ($respuesta->wasChanged('adjuntos')) {
            $oldAdjuntos = $respuesta->getOriginal('adjuntos');
            $newAdjuntos = $respuesta->adjuntos;

            $oldFiles = is_string($oldAdjuntos) ? json_decode($oldAdjuntos, true) : ($oldAdjuntos ?? []);
            $newFiles = is_string($newAdjuntos) ? json_decode($newAdjuntos, true) : ($newAdjuntos ?? []);

            $oldFilesNames = array_map(fn($f) => $f['original_name'] ?? '', $oldFiles);
            $newFilesNames = array_map(fn($f) => $f['original_name'] ?? '', $newFiles);

            // Determinar el tipo de cambio
            if (count($newFiles) > count($oldFiles)) {
                $tipoCambio = 'archivos_agregados';
                $descripcion = "Se agregaron archivos en la respuesta #{$respuesta->id} de la PQR #{$respuesta->pqr->pqr_codigo}";
            } elseif (count($newFiles) < count($oldFiles)) {
                $tipoCambio = 'archivos_eliminados';
                $descripcion = "Se eliminaron archivos en la respuesta #{$respuesta->id} de la PQR #{$respuesta->pqr->pqr_codigo}";
            } else {
                $tipoCambio = 'archivos_modificados';
                $descripcion = "Se modificaron archivos en la respuesta #{$respuesta->id} de la PQR #{$respuesta->pqr->pqr_codigo}";
            }

            EventLog::create([
                'event_type'      => $tipoCambio,
                'description'     => $descripcion,
                'pqr_id'          => $respuesta->pqrs_id,
                'pqr_codigo'      => $respuesta->pqr->pqr_codigo ?? null,
                'respuesta_id'    => $respuesta->id,
                'estado_anterior' => implode(', ', $oldFilesNames) ?: 'Sin archivos',
                'estado_nuevo'    => implode(', ', $newFilesNames) ?: 'Sin archivos',
                'fecha_evento'    => now(),
                'user_id'         => Auth::id(),
            ]);
        }
    }
}
