<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Pqr;
use App\Models\Respuesta;

class RespuestaFinalPQRSMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;
    public $respuesta;

    public function __construct(Pqr $pqr, Respuesta $respuesta)
    {
        $this->pqr = $pqr;
        $this->respuesta = $respuesta;
    }

    public function build()
    {
        return $this->subject('Respuesta a su PQRS')
                    ->view('emails.respuesta_final_pqrs');
    }
}