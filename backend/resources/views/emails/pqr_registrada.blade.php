@component('mail::message')
# Confirmación de registro de PQR

Hola {{ $pqr->nombre }} {{ $pqr->apellido }},

Tu PQR ha sido registrada exitosamente con la siguiente información:

- **ID:** {{ $pqr->pqr_codigo }}
- **Tipo de solicitud:** {{ $pqr->tipo_solicitud }}
- **Descripción:** {{ $pqr->descripcion }}

Gracias por contactarnos.

Saludos,  

@endcomponent
