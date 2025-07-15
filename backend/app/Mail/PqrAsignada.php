<?php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

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
        return $this->subject('Se te ha asignado una nueva PQR')
                    ->view('emails.pqr_asignada');
    }
}
