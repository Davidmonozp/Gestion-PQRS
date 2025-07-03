<?php

namespace App\Models;

use App\Services\PqrTiempoService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;


class Pqr extends Model
{
    protected $fillable = [
        // 📌 Datos del solicitante
        'pqr_codigo',
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
        'deadline_ciudadano',
        'deadline_interno',
        'respondido_en',
        'estado_tiempo',

        // token para respuesta del usuario
        'usuario_token'
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
    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->timezone('America/Bogota')->toDateTimeString();
    }
    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->timezone('America/Bogota')->toDateTimeString();
    }



    public function getTiempoRespondidoAttribute()
    {
        if (!$this->respondido_en) {
            return null;
        }

        $created = Carbon::parse($this->created_at);
        $respondido = Carbon::parse($this->respondido_en);

        $diffInMinutes = $created->diffInMinutes($respondido);

        $hours = floor($diffInMinutes / 60);
        $minutes = $diffInMinutes % 60;

        return "{$hours} horas y {$minutes} minutos";
    }



    public function getDeadlineCiudadanoAttribute()
    {
        if (!$this->created_at || !$this->prioridad) return null;

        $created = Carbon::parse($this->created_at);
        $hours = match ($this->prioridad) {
            'Vital' => 24,
            'Priorizado' => 48,
            'Simple' => 72,
            'Solicitud' => 48,
            default => 24
        };

        return $created->copy()->addHours($hours)->toDateTimeString();
    }

    protected $appends = [
        'deadline_ciudadano',
    ];
}
