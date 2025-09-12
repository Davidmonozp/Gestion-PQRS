<?php

namespace App\Observers;

use App\Models\Pqr;
use App\Models\EventLog;
use Illuminate\Support\Facades\Auth;

class TipoSolicitudObserver
{
    /**
     * Evento: cuando se actualiza el tipo de solicitud de una PQR
     */
    public function updated(Pqr $pqr)
    {
        if ($pqr->wasChanged('tipo_solicitud')) {
            $oldTipo = $pqr->getOriginal('tipo_solicitud');
            $newTipo = $pqr->tipo_solicitud;

            EventLog::create([
                'event_type'      => 'cambio_tipo_solicitud',
                'description'     => "La PQR #{$pqr->pqr_codigo} cambió de tipo_solicitud: {$oldTipo} → {$newTipo}",
                'pqr_id'          => $pqr->id,
                'pqr_codigo'      => $pqr->pqr_codigo,
                'estado_anterior' => $oldTipo,
                'estado_nuevo'    => $newTipo,
                'fecha_evento'    => now(),
                'user_id'         => Auth::id(),
            ]);
        }
    }
}
