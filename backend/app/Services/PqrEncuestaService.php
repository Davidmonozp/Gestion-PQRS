<?php

namespace App\Services;

use App\Models\Pqr;
use App\Models\PqrEncuesta;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class PqrEncuestaService
{
    public function programarEncuesta(Pqr $pqr)
    {
        // Crear token único
        $token = Str::random(60);

        // Guardar registro
        $encuesta = PqrEncuesta::create([
            'pqr_id' => $pqr->id,
            'token' => $token,
        ]);

        // Enviar correo
        Mail::to($pqr->correo)->send(
            new \App\Mail\EncuestaSatisfaccionMail($pqr, $encuesta)
        );

        return $encuesta;
    }
}
