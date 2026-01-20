<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            margin: 40px 45px;
            /* Márgenes como documento normal */
            text-align: justify;
            /* Justificación */
        }

        .logo {
            width: 150px;
            margin-bottom: 20px;
            /* Separación con el texto */
        }

        .footer-text {
            white-space: pre-line;
            line-height: 1.2;
            margin-top: 40px;
            /* Separación del contenido principal */
            font-size: 11px;
            text-align: left;
            /* Para que el pie no quede justificado */
        }
    </style>
</head>

<body>

    <!-- LOGO -->
    <img src="/storage/app/public/logo-passus.png" alt="" class="logo" style="width:157px;">

    <!-- CONTENIDO DE LA RESPUESTA -->
    <div>
        {!! $respuesta->contenido !!}
    </div>

    <!-- PIE DE PÁGINA -->
    <div class="footer-text">
        Sede Principal Bogotá Calle 142 N.º 16 A - 52
        Regionales: Bogotá, Cundinamarca, Tolima y Caquetá
        Teléfono: (601) 7450118
        notificacionesips@passusips.com
    </div>

</body>

</html>
