{{-- @component('mail::message') ya no es necesario si vas a usar HTML puro --}}
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style type="text/css">
        /* Aquí puedes definir estilos CSS que se aplicarán al correo */
        body {
            font-family: Arial, sans-serif;
            /* Nuevo font-family */
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
        }

        table {
            border-collapse: collapse;
        }

        p {
            margin: 0 0 10px;
            line-height: 1.5em;
        }

        strong {
            font-weight: bold;
        }

        /* Estilos específicos para la sección de detalles del radicado */
        .details-section {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .details-section p {
            margin: 5px 0;
        }

        .footer-text {
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>

<body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="header">
                            <a href="{{ url('/') }}" style="display: inline-block; text-decoration: none;">
                                <img src="{{ asset('storage/logo-passus.png') }}" alt="Passus IPS"
                                    style="max-width: 350px; height: auto;">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td class="body" width="100%" cellpadding="0" cellspacing="0">
                            <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0"
                                role="presentation">
                                <tr>
                                    <td class="content-cell">
                                        <h1>Consulta de Radicado: {{ $pqr->pqr_codigo }}</h1>

                                        <p>Estimado(a) {{ $pqr->nombre }} {{ $pqr->apellido }},</p>

                                        <p>Reciba un cordial saludo.</p>

                                        <p>En atención a su solicitud, le informamos los detalles del radicado
                                            consultado:</p>

                                        <div class="details-section">
                                            <p><strong>No. Radicado:</strong> {{ $pqr->pqr_codigo }}</p>
                                            <p><strong>Tipo de Solicitud:</strong> {{ $pqr->tipo_solicitud }}</p>
                                            <p><strong>Estado Actual:</strong> {{ $pqr->estado_respuesta }} actualizado
                                                el {{ $pqr->updated_at }}</p>
                                        </div>

                                        <hr> {{-- Esto es un separador HTML --}}

                                        @if ($pqr->respuesta_enviada == 0)
                                            <p><strong>Estado de Respuesta:</strong></p>
                                            <p>A la fecha, no se ha enviado respuesta a su solicitud. Estamos trabajando
                                                para brindarle una pronta solución.</p>
                                        @else
                                            <p><strong>Estado de Respuesta:</strong></p>
                                            <p>La respuesta a su solicitud fue enviada al correo
                                                <strong>{{ $pqr->correo }}</strong> el día
                                                <strong>{{ $pqr->respondido_en }}</strong>. Le invitamos a revisar su
                                                bandeja de entrada o carpeta de correo no deseado.</p>
                                        @endif

                                        <p>Agradecemos su confianza en <strong>Passus IPS</strong>. Estamos
                                            comprometidos con brindarle un servicio oportuno y de calidad. Para
                                            cualquier inquietud adicional, no dude en contactarnos.</p>

                                        <p>Atentamente,<br><strong>Passus IPS</strong></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center">
                            <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0"
                                role="presentation">
                                <tr>
                                    <td class="content-cell" align="center">
                                        <p class="footer-text">&copy; {{ date('Y') }} Passus IPS. Todos los
                                            derechos reservados.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
