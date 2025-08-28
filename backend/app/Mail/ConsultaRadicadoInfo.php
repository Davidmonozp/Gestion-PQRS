<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

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
            from: new Address('comunicaciones@passusips.com', 'Passus IPS'), // <-- ¡ESTA ES LA LÍNEA CLAVE!
            subject: 'Información de su radicado ' . $this->pqr->pqr_codigo, // Asunto que ya habías ajustado
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.consulta-radicado',
            with: ['pqr' => $this->pqr], // 🔥 Este es necesario
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
