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

class RespuestaFinalPQRSMail extends Mailable
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
            from: new Address('info@passusips.com', 'Passus IPS'),
            subject: 'Respuesta a su PQRS: ' . $this->pqr->pqr_codigo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Define la vista para el cuerpo del correo.
        return new Content(
            view: 'emails.respuesta_final_pqrs',
        );
    }

    /**
     * Build the message, handling attachments.
     *
     * @return $this
     */
    public function build()
    {
        // Se enfoca únicamente en la lógica de adjuntar archivos.
        // Se usa un bloque try-catch para manejar errores en la descarga del archivo.
        foreach ($this->adjuntos as $adjunto) {
            $fileUrl = $adjunto['url'] ?? null;

            if ($fileUrl) {
                try {
                    // Obtenemos el contenido del archivo desde la URL de forma segura.
                    $fileContent = file_get_contents($fileUrl);
                    if ($fileContent !== false) {
                        // Para obtener el tipo MIME de forma correcta y segura,
                        // lo guardamos temporalmente para usar la función `mime_content_type`.
                        $tempFile = tempnam(sys_get_temp_dir(), 'attachment');
                        file_put_contents($tempFile, $fileContent);

                        $this->attachData($fileContent, $adjunto['original_name'], [
                            'mime' => mime_content_type($tempFile),
                        ]);

                        // Es importante eliminar el archivo temporal después de adjuntarlo.
                        unlink($tempFile);
                    }
                } catch (\Exception $e) {
                    // En caso de que la URL no sea válida o el archivo no se pueda descargar,
                    // se registra un error y se continúa con los otros adjuntos.
                    Log::warning("No se pudo adjuntar el archivo desde la URL: " . $fileUrl . ". Error: " . $e->getMessage());
                }
            }
        }

        return $this;
    }
}
