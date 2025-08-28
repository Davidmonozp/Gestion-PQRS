<?php

// app/Mail/RespuestaPqrsMail.php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

class RespuestaPqrsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;

    public function __construct(Pqr $pqr)
    {
        $this->pqr = $pqr;
    }

    public function build()
    {
        return $this->subject('Respuesta a su PQRS')
                    ->view('emails.respuesta_pqrs');
    }
    public function envelope(): Envelope
    {
       return new Envelope(
            from: new Address('comunicaciones@passusips.comfo@passusips.com', 'Passus IPS'), // <-- ¡ESTA ES LA LÍNEA CLAVE!
        );
    }
    
}
