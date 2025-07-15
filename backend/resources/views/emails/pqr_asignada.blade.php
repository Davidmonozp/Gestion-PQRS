<!DOCTYPE html>
<html>
<head>
    <title>PQR Asignada</title>
</head>
<body>
    <h1>Hola {{ $pqr->asignado->name }}</h1>
    <p>Se te ha asignado la PQR con código: <strong>{{ $pqr->pqr_codigo }}</strong>.</p>
    <p>Descripción: {{ $pqr->descripcion }}</p>
    <p>Por favor revisa el sistema para más detalles.</p>
</body>
</html>
