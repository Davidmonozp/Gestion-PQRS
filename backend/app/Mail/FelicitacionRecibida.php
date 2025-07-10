<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

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
}
