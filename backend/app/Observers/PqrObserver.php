<?php

namespace App\Observers;

use App\Models\Pqr;
use App\Models\EventLog;
use Illuminate\Support\Facades\Auth;

class PqrObserver
{
    /**
     * Handle the Pqr "created" event.
     */
    public function created(Pqr $pqr): void
    {
        //
    }

    /**
     * Handle the Pqr "updated" event.
     */
    public function updated(Pqr $pqr)
    {
        // Detecta si el estado_respuesta cambió
        if ($pqr->isDirty('estado_respuesta')) {
            EventLog::create([
                'event_type' => 'cambio_estado_respuesta',
                'description' => "La PQR #{$pqr->pqr_codigo} cambió su estado de respuesta de '{$pqr->getOriginal('estado_respuesta')}' a '{$pqr->estado_respuesta}'",
                'pqr_id' => $pqr->id,
                'pqr_codigo' => $pqr->pqr_codigo,
                'estado_anterior' => $pqr->getOriginal('estado_respuesta'),
                'estado_nuevo' => $pqr->estado_respuesta,
                'fecha_evento' => now(),
                'user_id' => Auth::id(), 
            ]);
        }
    }

    /**
     * Handle the Pqr "deleted" event.
     */
    public function deleted(Pqr $pqr): void
    {
        //
    }

    /**
     * Handle the Pqr "restored" event.
     */
    public function restored(Pqr $pqr): void
    {
        //
    }

    /**
     * Handle the Pqr "force deleted" event.
     */
    public function forceDeleted(Pqr $pqr): void
    {
        //
    }
}
