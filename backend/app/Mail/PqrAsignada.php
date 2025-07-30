<?php

namespace App\Mail;

use App\Models\Pqr;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;
use App\Models\User;


class PqrAsignada extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;
    public $usuario;

    public function __construct(Pqr $pqr, User $usuario)
    {
        $this->pqr = $pqr;
        $this->usuario = $usuario;
    }

    public function build()
    {
        return $this->subject('Se le ha asignado una nueva PQR')
                    ->view('emails.pqr_asignada');
    }
   

}
