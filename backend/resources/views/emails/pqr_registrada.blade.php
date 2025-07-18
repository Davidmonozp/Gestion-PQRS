<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Confirmación de Registro de PQR: {{ $pqr->pqr_codigo }}</title>
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
        .pqr-summary-box {
            background-color: #e6f7ff; /* Fondo azul muy claro para la caja de resumen */
            border-left: 5px solid #007bff; /* Barra lateral azul distintiva */
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        .pqr-summary-box p {
            margin: 0 0 8px;
            font-size: 15px;
        }
        .pqr-summary-box p:last-child {
            margin-bottom: 0;
        }
        .pqr-summary-box strong {
            color: #0056b3; /* Un azul más oscuro para las etiquetas */
        }
        .pqr-description-text {
            font-style: italic;
            color: #555555;
            margin-left: 15px; /* Indentación para la descripción */
            border-left: 3px solid #ccc; /* Separador visual para la descripción */
            padding-left: 10px;
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
                            <a href="{{ url('/') }}" target="_blank" style="display: inline-block; text-decoration: none;">
                                <img src="{{ asset('storage/logo-passus.png') }}" alt="Passus IPS Logo" border="0">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td class="body-content">
                            <h1>Confirmación de Registro de PQR</h1>

                            <p>Estimado(a) <strong>{{ $pqr->nombre }} {{ $pqr->apellido }}</strong>,</p>

                            <p>Gracias por contactarnos. Le confirmamos que su PQR ha sido registrada exitosamente con la siguiente información:</p>

                            <div class="pqr-summary-box">
                                <p><strong>Código de PQR:</strong> <span style="font-size: 1.1em; color: #007bff; font-weight: bold;">{{ $pqr->pqr_codigo }}</span></p>
                                <p><strong>Tipo de Solicitud:</strong> {{ $pqr->tipo_solicitud }}</p>
                                <p><strong>Descripción de la Solicitud:</strong></p>
                                <p class="pqr-description-text">{{ $pqr->descripcion }}</p>
                                @if (isset($pqr->created_at) && $pqr->created_at)
                                    <p><strong>Fecha de Registro:</strong> {{ Carbon\Carbon::parse($pqr->created_at)->format('d/m/Y H:i') }}</p>
                                @endif
                                <p><strong>Estado Actual:</strong> <span style="font-weight: bold; color: #28a745;">Registrada</span></p>
                            </div>

                            <p>Agradecemos su paciencia mientras procesamos su solicitud. Haremos todo lo posible por brindarle una respuesta oportuna.</p>
                            <p>Puede hacer seguimiento al estado de su PQR ingresando el código de radicado en nuestra página web:</p>

                            <div class="button-container">
                                <a href="{{ url('http://localhost:5173/inicio-pqrs') }}" target="_blank">Consultar Estado de PQR</a> {{-- Asegúrate de que esta URL sea la correcta --}}
                            </div>

                            <hr class="divider">

                            <p>Saludos cordiales,<br>El equipo de <strong>Passus IPS</strong></p>
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