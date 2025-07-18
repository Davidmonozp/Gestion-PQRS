<?php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;


class PqrAsignada extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;

    public function __construct(Pqr $pqr)
    {
        $this->pqr = $pqr;
    }

    public function build()
    {
        return $this->subject('Se le ha asignado una nueva PQR')
                    ->view('emails.pqr_asignada');
    }
     public function envelope(): Envelope
    {
       return new Envelope(
            from: new Address('info@passusips.com', 'Passus IPS'), // <-- ¡ESTA ES LA LÍNEA CLAVE!
        );
    }

}
