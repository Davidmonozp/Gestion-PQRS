<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            /* Fuente profesional */
            -webkit-text-size-adjust: none;
            /* Previene el ajuste de tamaño de texto en iOS */
            background-color: #f5f7fa;
            /* Un fondo suave para el cuerpo */
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
            overflow: hidden;
            /* Asegura que los bordes redondeados se vean bien */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            /* Sombra más pronunciada */
        }

        /* Sección de encabezado (logo) */
        .header-section {
            background-color: #ffffff;
            /* Fondo blanco */
            padding: 25px;
            /* Más padding */
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }

        .header-section img {
            max-width: 250px;
            /* Ajustado para que el logo no sea demasiado grande */
            height: auto;
            display: block;
            /* Para centrar la imagen */
            margin: 0 auto;
            /* Para centrar la imagen */
        }

        /* Contenido principal del correo */
        .body-content {
            padding: 30px;
            text-align: left;
        }

        .body-content h1 {
            color: #1a237e;
            /* Azul oscuro para los títulos, más empresarial */
            font-size: 28px;
            /* Título principal más grande */
            margin-top: 0;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
            /* Un poco más de peso a la fuente */
        }

        .pqr-info-box {
            background-color: #f8f9fa;
            /* Fondo gris claro para la información de PQR */
            border-left: 5px solid #007bff;
            /* Barra lateral azul distintiva */
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
            color: #0056b3;
            /* Un azul más oscuro para las etiquetas */
        }

        /* Estilos específicos para la cita de respuesta */
        .response-quote {
            background-color: #e6f7ff;
            /* Un azul muy claro para el fondo de la respuesta */
            border-left: 4px solid #0056b3;
            /* Borde más oscuro para la cita */
            padding: 20px;
            margin: 25px 0;
            /* Espaciado antes y después */
            border-radius: 4px;
            font-style: italic;
            /* Para que la respuesta se vea como una cita */
            color: #444444;
            text-align: justify;
            /* Mantiene la justificación */
            white-space: pre-line;
            /* Mantiene saltos de línea */
            font-size: 15px;
        }

        .response-quote p {
            margin: 0;
            /* Asegura que no haya márgenes extra dentro del blockquote */
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
            background-color: #007bff;
            /* Botón azul para acción */
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
            background-color: #0056b3;
            /* Azul más oscuro al pasar el ratón */
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
                            <a href="{{ url('https://passusips.com/index.php') }}" target="_blank"
                                style="display: inline-block; text-decoration: none;">
                                <img src="data:image/png;base64,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" alt="Passus IPS Logo" border="0">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td class="body-content">
                            <h1>Respuesta a su PQR</h1>

                            <p>Estimado/a <strong>{{ $pqr->nombre }} {{ $pqr->apellido }}</strong>:</p>

                            <p>Agradecemos su paciencia y el tiempo dedicado para presentar su solicitud.
                                En relación con su PQR, le compartimos la siguiente información:</p>

                            <div class="pqr-info-box">
                                <p><strong>Radicado:</strong> <span
                                        style="font-size: 1.1em; color: #007bff; font-weight: bold;">{{ $pqr->pqr_codigo }}</span>
                                </p>
                                <p><strong>Tipo de Solicitud:</strong> {{ $pqr->tipo_solicitud }}</p>
                                <p><strong>Estado Actual:</strong> <span
                                        style="font-weight: bold; color: #28a745;">Contestada</span></p>
                                @if (isset($pqr->created_at) && $pqr->created_at)
                                    <p><strong>Fecha de Registro:</strong>
                                        {{ Carbon\Carbon::parse($pqr->created_at)->format('d/m/Y H:i') }}</p>
                                @endif
                                @if (isset($respuesta->fecha_respuesta) && $respuesta->fecha_respuesta)
                                    {{-- Asumiendo que $respuesta tiene una fecha de respuesta --}}
                                    <p><strong>Fecha de Respuesta:</strong>
                                        {{ Carbon\Carbon::parse($respuesta->fecha_respuesta)->format('d/m/Y H:i') }}</p>
                                @endif
                            </div>

                            <div class="response-quote">
                                {!! $respuesta->contenido !!}
                            </div>

                            <p>Esperamos que esta respuesta haya aclarado su inquietud. Si necesita asistencia adicional
                                o tiene más preguntas, no dude en contactarnos.</p> <br>
                                <p>Agradecemos su confianza en PASSUS.</p>                          

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
