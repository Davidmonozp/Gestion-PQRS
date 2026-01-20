<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Pqr;
use App\Models\Respuesta;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class RespuestaTutelaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pqr;
    public $respuesta;
    public $adjuntos;

    /**
     * Create a new message instance.
     */
    public function __construct(Pqr $pqr, Respuesta $respuesta, $adjuntos = [])
    {
        $this->pqr = $pqr;
        $this->respuesta = $respuesta;
        $this->adjuntos = $adjuntos;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Define el asunto del correo y el remitente aquí, siguiendo la sintaxis moderna.
        return new Envelope(
            from: new Address('comunicaciones@passusips.com', 'Passus IPS'),
            subject: 'Respuesta a la Tutela: ' . $this->pqr->radicado_juzgado,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Define la vista para el cuerpo del correo.
        return new Content(
            view: 'emails.respuesta_tutela',
        );
    }

    /**
     * Build the message, handling attachments.
     *
     * @return $this
     */

    public function build()
    {
        Log::info("✔ Entrando a RespuestaTutelaMail::build para PQR {$this->pqr->pqr_codigo}");
        // 1. Adjuntar los archivos subidos por el usuario (ya lo tienes)
        foreach ($this->adjuntos as $adjunto) {
            $fileUrl = $adjunto['url'] ?? null;

            if ($fileUrl) {
                try {
                    $fileContent = file_get_contents($fileUrl);
                    if ($fileContent !== false) {
                        $tempFile = tempnam(sys_get_temp_dir(), 'attachment');
                        file_put_contents($tempFile, $fileContent);

                        $this->attachData($fileContent, $adjunto['original_name'], [
                            'mime' => mime_content_type($tempFile),
                        ]);

                        unlink($tempFile);
                    }
                } catch (\Exception $e) {
                    Log::warning("No se pudo adjuntar el archivo: " . $fileUrl);
                }
            }
        }

        // 2. ⬅️ GENERAR PDF DESDE LA PLANTILLA respuesta_pdf.blade.php
        $pdf = Pdf::loadView('emails.respuesta_pdf', [
            'pqr' => $this->pqr,
            'respuesta' => $this->respuesta,
        ])->setPaper('letter');

        // 3. ⬅️ ADJUNTAR EL PDF AL CORREO
        $this->attachData(
            $pdf->output(),
            'Respuesta-PQRS-' . $this->pqr->pqr_codigo . '.pdf',
            ['mime' => 'application/pdf']
        );

        return $this;
    }
}
