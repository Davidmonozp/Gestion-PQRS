<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1.0-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>¡Gracias por tu felicitación, {{ $pqr->nombre }}!</title>
    <style type="text/css">
        /* Estilos generales */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Fuente más empresarial */
            -webkit-text-size-adjust: none;
            background-color: #f2f4f6; /* Un fondo suave para el cuerpo */
            color: #333333;
            line-height: 1.6;
        }
        table {
            border-collapse: collapse;
        }
        p {
            margin: 0 0 10px;
            line-height: 1.6em; /* Mejorar legibilidad */
        }
        a {
            color: #007bff; /* Color de enlaces */
            text-decoration: none;
        }
        strong {
            font-weight: bold;
        }

        /* Contenedor principal del correo */
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f2f4f6;
            padding: 20px 0;
        }
        .content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        /* Sección de encabezado (logo) */
        .header-section {
            background-color: #ffffff; /* Fondo blanco para el encabezado */
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }
        .header-section img {
            max-width: 350px; /* Tamaño del logo */
            height: auto;
            display: block; /* Para centrar la imagen */
            margin: 0 auto; /* Para centrar la imagen */
        }

        /* Contenido principal del correo */
        .body-content {
            padding: 30px;
            text-align: left; /* Alineación de texto por defecto */
        }
        .body-content h1 {
            color: #1a237e; /* Azul oscuro para los títulos */
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center; /* Centrar el título principal */
        }
        .info-section {
            background-color: #f8f9fa; /* Un color ligeramente diferente para la sección de info */
            border-left: 5px solid #007bff; /* Barra lateral azul */
            padding: 15px 20px;
            margin-bottom: 25px;
            border-radius: 4px;
        }
        .info-section p {
            margin-bottom: 8px;
        }
        .info-section strong {
            color: #0056b3; /* Un azul más oscuro para las etiquetas */
        }
        .divider {
            border: 0;
            border-top: 1px solid #eeeeee;
            margin: 25px 0;
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
        }
    </style>
</head>
<body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="header-section">
                            <img src="{{ asset('storage/logo-passus.png') }}" alt="Passus IPS">
                        </td>
                    </tr>

                    <tr>
                        <td class="body-content">
                            <h1>¡Gracias por tu felicitación, {{ $pqr->nombre }}!</h1>

                            <p>Estimado(a) {{ $pqr->nombre }} {{ $pqr->apellido }},</p>
                            <p>Reciba un cordial saludo de parte de Passus IPS.</p>

                            <p>Hemos recibido con gran satisfacción su mensaje y le confirmamos que ha sido registrado con el siguiente radicado:</p>

                            <div style="text-align: center; font-size: 20px; font-weight: bold; color: #007bff; margin: 20px 0;">
                                {{ $pqr->pqr_codigo }}
                            </div>

                            <p>Detalles de su felicitación:</p>
                            <div class="info-section">
                                <p><strong>Tipo de solicitud:</strong> {{ $pqr->tipo_solicitud }}</p>
                                <p><strong>Descripción:</strong></p>
                                <p style="margin-left: 15px; font-style: italic;">{{ $pqr->descripcion }}</p>
                            </div>

                            <hr class="divider">

                            <p>Agradecemos sinceramente sus comentarios positivos. Son un valioso motor para nuestro compromiso continuo con la excelencia en el servicio y la calidad de la atención que brindamos.</p>
                            <p>Nos complace saber que nuestros esfuerzos cumplen con sus expectativas.</p>

                            <p>Saludos cordiales,</p>
                            <p><strong>El equipo de Passus IPS</strong></p>
                        </td>
                    </tr>

                    <tr>
                        <td class="footer-section">
                            <p>&copy; {{ date('Y') }} Passus IPS. Todos los derechos reservados.</p>
                            <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>