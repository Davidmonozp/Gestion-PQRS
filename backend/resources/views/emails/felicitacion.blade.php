@component('mail::message')
# ¡Gracias por tu felicitación, {{ $pqr->nombre }}!

Hemos recibido tu felicitación con el siguiente código:

**{{ $pqr->pqr_codigo }}**

---

**Tipo de solicitud:** {{ $pqr->tipo_solicitud }}  
**Descripción:**  
{{ $pqr->descripcion }}

---

Agradecemos tus comentarios positivos. Nos motivan a seguir mejorando.

Saludos cordiales,  
**Passus IPS**

@endcomponent
