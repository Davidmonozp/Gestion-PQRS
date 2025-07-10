<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ConsultaRadicadoInfo extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;

    public function __construct($pqr)
    {
        $this->pqr = $pqr;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Información de tu radicado ' . $this->pqr->pqr_codigo,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.consulta-radicado',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
