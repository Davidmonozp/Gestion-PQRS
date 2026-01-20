<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class EncuestaSatisfaccionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;
    public $encuesta;

    public function __construct($pqr, $encuesta)
    {
        $this->pqr = $pqr;
        $this->encuesta = $encuesta;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('comunicaciones@passusips.com', 'Passus IPS'),
            subject: 'Encuesta de satisfacción - Radicado ' . $this->pqr->pqr_codigo,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.encuesta',
            with: [
                'pqr' => $this->pqr,
                'encuesta' => $this->encuesta,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
