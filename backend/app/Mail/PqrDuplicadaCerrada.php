<?php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PqrDuplicadaCerrada extends Mailable
{
    use Queueable, SerializesModels;

    public $pqrDuplicada;
    public $pqrMaestra;

    /**
     * Crea una nueva instancia del mensaje.
     *
     * @param Pqr $pqrDuplicada La PQR duplicada que se acaba de cerrar.
     * @param Pqr $pqrMaestra La PQR Maestra a la que fue asociada.
     * @return void
     */
    public function __construct(Pqr $pqrDuplicada, Pqr $pqrMaestra)
    {
        $this->pqrDuplicada = $pqrDuplicada;
        $this->pqrMaestra = $pqrMaestra;
    }

    /**
     * Construye el mensaje.
     *
     * @return $this
     */
    public function build()
    {
        // Usa el asunto que quieres que vean los usuarios
        return $this->subject('Notificación: Su PQR ha sido marcada como duplicada y cerrada')
            // Apunta a la plantilla Blade que creaste: resources/views/emails/pqrs/duplicada_cerrada.blade.php
            ->view('emails.pqr_duplicada_cerrada')
            ->with(['pqr' => $this->pqrDuplicada]);
    }
}
