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
    public $adjuntos;

    public function __construct(Pqr $pqr, Respuesta $respuesta, $adjuntos = [])
    {
        $this->pqr = $pqr;
        $this->respuesta = $respuesta;
        $this->adjuntos = $adjuntos;
    }

  public function build()
{
    $email = $this->subject('Respuesta a su PQRS')
                  ->view('emails.respuesta_final_pqrs');

    foreach ($this->adjuntos as $adjunto) {
        $storagePath = storage_path('app/public/' . $adjunto['path']);

        if (file_exists($storagePath)) {
            $email->attach($storagePath, [
                'as'   => $adjunto['original_name'],
                'mime' => mime_content_type($storagePath),
            ]);
        }
    }

    return $email;
}
}
