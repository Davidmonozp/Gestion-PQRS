<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Consulta de Radicado: {{ $pqr->pqr_codigo }}</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            -webkit-text-size-adjust: none;
            background-color: #f5f7fa;
            color: #333333;
            line-height: 1.6;
        }

        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        td {
            padding: 0;
        }

        p {
            margin: 0 0 10px;
            line-height: 1.6em;
        }

        a {
            color: #007bff;
            text-decoration: none;
        }

        strong {
            font-weight: bold;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f5f7fa;
            padding: 20px 0;
        }

        .content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .header-section {
            background-color: #ffffff;
            padding: 25px;
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }

        .header-section img {
            max-width: 250px;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .body-content {
            padding: 30px;
            text-align: left;
        }

        .body-content h1 {
            color: #1a237e;
            font-size: 28px;
            margin-top: 0;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
        }

        .pqr-details-box {
            background-color: #e9f0f7;
            border-left: 5px solid #007bff;
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 4px;
        }

        .pqr-details-box p {
            margin: 0 0 8px;
            font-size: 15px;
        }

        .pqr-details-box strong {
            color: #0056b3;
        }

        .divider {
            border: 0;
            border-top: 1px solid #e0e0e0;
            margin: 30px 0;
        }

        .footer-section {
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
            border-top: 1px solid #e0e0e0;
        }

        @media only screen and (max-width: 600px) {
            .content {
                width: 100% !important;
                border-radius: 0 !important;
            }

            .body-content,
            .header-section,
            .footer-section {
                padding: 20px !important;
            }

            .header-section img {
                max-width: 200px !important;
            }
        }
    </style>
</head>

<body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center" valign="top">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="header-section">
                            <a href="{{ url('https://passusips.com/') }}" target="_blank"
                                style="display: inline-block; text-decoration: none;">
                                <img src="{{ asset('storage/logo-passus.png') }}" alt="Passus IPS Logo" border="0">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td class="body-content">
                            <h1>Consulta de Radicado</h1>

                            <p>Estimado(a) {{ $pqr->nombre }} {{ $pqr->apellido }},</p>

                            <p>En atención a su solicitud, le informamos los detalles del radicado consultado:</p>

                            <div class="pqr-details-box">
                                <p><strong>No. Radicado:</strong> {{ $pqr->pqr_codigo }}</p>
                                <p><strong>Tipo de Solicitud:</strong> {{ $pqr->tipo_solicitud }}</p>
                                @php
                                    \Carbon\Carbon::setLocale('es');
                                @endphp
                                <p><strong>Estado Actual:</strong> {{ $pqr->estado_respuesta }}, actualizado por última vez el
                                    {{ \Carbon\Carbon::parse($pqr->updated_at)->translatedFormat('d \d\e F \d\e Y \a \l\a\s H:i') }}
                                </p>

                                @if ($pqr->respuesta_enviada == 0)
                                    <p><strong>Estado de Respuesta:</strong> No se ha enviado respuesta aún.</p>
                                @else
                                    <p><strong>Respuesta Enviada a:</strong> {{ $pqr->correo }} el
                                        {{ $pqr->respondido_en }}</p>
                                @endif
                            </div>

                            <p>Agradecemos su confianza en <strong>Passus IPS</strong>. Estamos comprometidos con
                                brindarle un
                                servicio oportuno y de calidad. Para cualquier inquietud adicional, no dude en
                                contactarnos.</p>

                            <p>Atentamente,<br><strong>Passus IPS</strong></p>
                        </td>
                    </tr>

                    <tr>
                        <td class="footer-section">
                            <p>&copy; {{ date('Y') }} Passus IPS. Todos los derechos reservados.</p>
                            <p>Este es un correo automático. Por favor, no responda directamente a este mensaje.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
