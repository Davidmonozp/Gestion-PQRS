@component('mail::message')
# Consulta de Radicado: {{ $pqr->pqr_codigo }}

**Nombre:** {{ $pqr->nombre }} {{ $pqr->apellido }}

**Tipo de Solicitud:** {{ $pqr->tipo_solicitud }}

**Estado actual:** {{ $pqr->estado_actual ?? 'N/A' }}

@isset($pqr->estados)
## Historial de Estados:
@foreach($pqr->estados as $estado)
- {{ $estado->nombre }} ({{ $estado->created_at->format('d/m/Y H:i') }})
@endforeach
@endisset

Gracias,<br>
{{ config('app.name') }}
@endcomponent
