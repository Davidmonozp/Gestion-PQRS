<?php

// app/Mail/RespuestaPqrsMail.php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

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
}
