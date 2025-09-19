<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

class FelicitacionGestorNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;

    public function __construct($pqr)
    {
        $this->pqr = $pqr;
    }

    public function build()
    {
        return $this->subject('¡Felicitación Recibida!')
                    ->markdown('emails.felicitacion-gestor');
    }
    
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('comunicaciones@passusips.com', 'Passus IPS'),
        );
    }
}