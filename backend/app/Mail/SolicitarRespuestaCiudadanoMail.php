<?php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SolicitarRespuestaCiudadanoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;
    public $link;

    /**
     * Create a new message instance.
     */
    public function __construct(Pqr $pqr, $link)
    {
        $this->pqr = $pqr;
        $this->link = $link;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Respuesta requerida - PQRS')
                    ->view('emails.respuesta_ciudadano');
    }
}
