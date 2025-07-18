<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Respuesta a su PQR: {{ $pqr->pqr_codigo }}</title>
    <style type="text/css">
        /* Estilos generales para el cuerpo del correo */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fuente profesional */
            -webkit-text-size-adjust: none; /* Previene el ajuste de tamaño de texto en iOS */
            background-color: #f5f7fa; /* Un fondo suave para el cuerpo */
            color: #333333;
            line-height: 1.6;
        }
        /* Reinicio de estilos de tabla para asegurar compatibilidad */
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

        /* Contenedor principal del correo */
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
            overflow: hidden; /* Asegura que los bordes redondeados se vean bien */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Sombra más pronunciada */
        }

        /* Sección de encabezado (logo) */
        .header-section {
            background-color: #ffffff; /* Fondo blanco */
            padding: 25px; /* Más padding */
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }
        .header-section img {
            max-width: 250px; /* Ajustado para que el logo no sea demasiado grande */
            height: auto;
            display: block; /* Para centrar la imagen */
            margin: 0 auto; /* Para centrar la imagen */
        }

        /* Contenido principal del correo */
        .body-content {
            padding: 30px;
            text-align: left;
        }
        .body-content h1 {
            color: #1a237e; /* Azul oscuro para los títulos, más empresarial */
            font-size: 28px; /* Título principal más grande */
            margin-top: 0;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600; /* Un poco más de peso a la fuente */
        }
        .pqr-info-box {
            background-color: #f8f9fa; /* Fondo gris claro para la información de PQR */
            border-left: 5px solid #007bff; /* Barra lateral azul distintiva */
            padding: 15px 20px;
            margin-bottom: 25px;
            border-radius: 4px;
            font-size: 15px;
        }
        .pqr-info-box p {
            margin: 0 0 5px;
        }
        .pqr-info-box p:last-child {
            margin-bottom: 0;
        }
        .pqr-info-box strong {
            color: #0056b3; /* Un azul más oscuro para las etiquetas */
        }

        /* Estilos específicos para la cita de respuesta */
        .response-quote {
            background-color: #e6f7ff; /* Un azul muy claro para el fondo de la respuesta */
            border-left: 4px solid #0056b3; /* Borde más oscuro para la cita */
            padding: 20px;
            margin: 25px 0; /* Espaciado antes y después */
            border-radius: 4px;
            font-style: italic; /* Para que la respuesta se vea como una cita */
            color: #444444;
            text-align: justify; /* Mantiene la justificación */
            white-space: pre-line; /* Mantiene saltos de línea */
            font-size: 15px;
        }
        .response-quote p {
            margin: 0; /* Asegura que no haya márgenes extra dentro del blockquote */
        }

        /* Separador visual */
        .divider {
            border: 0;
            border-top: 1px solid #e0e0e0;
            margin: 30px 0;
        }

        /* Call to Action Button (opcional, pero útil) */
        .button-container {
            text-align: center;
            margin-top: 30px;
            margin-bottom: 20px;
        }
        .button-container a {
            display: inline-block;
            background-color: #007bff; /* Botón azul para acción */
            color: #ffffff;
            padding: 12px 25px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            transition: background-color 0.2s ease-in-out;
        }
        .button-container a:hover {
            background-color: #0056b3; /* Azul más oscuro al pasar el ratón */
        }

        /* Sección de pie de página */
        .footer-section {
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
            border-top: 1px solid #e0e0e0;
        }
        .footer-section p {
            margin: 0;
        }

        /* Responsividad básica (muy limitada en email, pero ayuda un poco) */
        @media only screen and (max-width: 600px) {
            .content {
                width: 100% !important;
                border-radius: 0 !important;
            }
            .body-content, .header-section, .footer-section {
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
                            <a href="{{ url('https://passusips.com/index.php') }}" target="_blank" style="display: inline-block; text-decoration: none;">
                                <img src="{{ asset('storage/logo-passus.png') }}" alt="Passus IPS Logo" border="0">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td class="body-content">
                            <h1>Respuesta a su PQR</h1>

                            <p>Estimado/a <strong>{{ $pqr->nombre }} {{ $pqr->apellido }}</strong>:</p>

                            <p>Agradecemos su paciencia. En relación a su PQR con código <strong>{{ $pqr->pqr_codigo }}</strong>, a continuación, le proporcionamos nuestra respuesta oficial:</p>

                            <div class="pqr-info-box">
                                <p><strong>Código de PQR:</strong> <span style="font-size: 1.1em; color: #007bff; font-weight: bold;">{{ $pqr->pqr_codigo }}</span></p>
                                <p><strong>Tipo de Solicitud:</strong> {{ $pqr->tipo_solicitud }}</p>
                                <p><strong>Estado Actual:</strong> <span style="font-weight: bold; color: #28a745;">Respondida</span></p>
                                @if (isset($pqr->created_at) && $pqr->created_at)
                                    <p><strong>Fecha de Registro:</strong> {{ Carbon\Carbon::parse($pqr->created_at)->format('d/m/Y H:i') }}</p>
                                @endif
                                @if (isset($respuesta->fecha_respuesta) && $respuesta->fecha_respuesta) {{-- Asumiendo que $respuesta tiene una fecha de respuesta --}}
                                    <p><strong>Fecha de Respuesta:</strong> {{ Carbon\Carbon::parse($respuesta->fecha_respuesta)->format('d/m/Y H:i') }}</p>
                                @endif
                            </div>

                            <div class="response-quote">
                                {!! $respuesta->contenido !!}
                            </div>

                            <p>Esperamos que esta respuesta haya aclarado su inquietud. Si necesita asistencia adicional o tiene más preguntas, no dude en contactarnos.</p>

                            <div class="button-container">
                                <a href="{{ url('/consulta-pqr') }}" target="_blank">Consultar su PQR</a> {{-- Puedes enlazar a la consulta general o a la específica si es posible --}}
                            </div>

                            <hr class="divider">

                            <p>Atentamente,<br>El equipo de <strong>Passus IPS</strong></p>
                        </td>
                    </tr>

                    <tr>
                        <td class="footer-section">
                            <p>&copy; {{ date('Y') }} Passus IPS. Todos los derechos reservados.</p>
                            <p>Este es un correo automático. Por favor, no respondas directamente a este mensaje.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>