<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

class FelicitacionRecibida extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;

    public function __construct($pqr)
    {
        $this->pqr = $pqr;
    }

    public function build()
    {
        return $this->subject('¡Gracias por tu felicitación!')
                    ->markdown('emails.felicitacion');
    }
    public function envelope(): Envelope
    {
       return new Envelope(
            from: new Address('info@passusips.com', 'Passus IPS'), // <-- ¡ESTA ES LA LÍNEA CLAVE!
        );
    }
    
}
