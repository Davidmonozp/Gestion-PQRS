<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

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
}
