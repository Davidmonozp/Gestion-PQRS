<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;


class PqrRegistrada extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;

    public function __construct($pqr)
    {
        $this->pqr = $pqr;
    }

    public function build()
    {
        return $this->subject('Tu PQR ha sido registrada')
                    ->markdown('emails.pqr_registrada');
    }
    public function envelope(): Envelope
    {
       return new Envelope(
            from: new Address('comunicaciones@passusips.com', 'Passus IPS'), // <-- ¡ESTA ES LA LÍNEA CLAVE!
        );
    }
}
