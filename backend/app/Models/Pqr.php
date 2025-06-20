<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pqr extends Model
{
    protected $fillable = [
        // 📌 Datos del solicitante
        'nombre',
        'apellido',
        'documento_tipo',
        'documento_numero',
        'correo',
        'telefono',
        'sede',
        'servicio_prestado',
        'eps',
        'tipo_solicitud',
        'descripcion',
        'archivo',
        'atributo_calidad',
        'fuente',
        'asignado_a',

        // ✅ Datos del registrador
        'registra_otro',
        'registrador_nombre',
        'registrador_apellido',
        'registrador_documento_tipo',
        'registrador_documento_numero',
        'registrador_correo',
        'registrador_telefono',

        // Estados de respuesta
        'estado_respuesta',
        'respuesta_enviada',
        'prioridad',
        'deadline'
    ];
    public function respuestas()
    {
        return $this->hasMany(Respuesta::class, 'pqrs_id');
    }

    public function asignado()
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }
    public function setPrioridadAttribute($value)
    {
        if ($this->prioridad) return;
        $this->attributes['prioridad'] = $value;
    }
}
