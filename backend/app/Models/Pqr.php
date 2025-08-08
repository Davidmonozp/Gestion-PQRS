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
        'segundo_nombre',
        'apellido',
        'segundo_apellido',
        'documento_tipo',
        'documento_numero',
        'correo',
        'telefono',
        'sede',
        'servicio_prestado',
        'eps',
        'regimen',
        'tipo_solicitud',
        'clasificacion_tutela',
        'accionado',
        'descripcion',
        'archivo',
        'atributo_calidad',
        'fuente',
        'fecha_inicio_real',

        // ✅ Datos del registrador
        'registra_otro',
        'registrador_nombre',
        'registrador_segundo_nombre',
        'registrador_apellido',
        'registrador_segundo_apellido',
        'registrador_documento_tipo',
        'registrador_documento_numero',
        'registrador_correo',
        'registrador_telefono',
        'registrador_cargo',
        'nombre_entidad',
        'parentesco',

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

    protected $casts = [
        'archivo' => 'array',
        'accionado' => 'array',
    ];
    public function respuestas()
    {
        return $this->hasMany(Respuesta::class, 'pqrs_id');
    }

    public function asignados()
    {
        return $this->belongsToMany(User::class, 'pqrs_user');
    }
    public function asignado()
    {
        return $this->asignados();
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
        if (!$this->prioridad) {
            return null;
        }

        // Usar fecha_inicio_real si existe, sino created_at
        $base = $this->fecha_inicio_real
            ? Carbon::parse($this->fecha_inicio_real)
            : Carbon::parse($this->created_at);

        $hours = match ($this->prioridad) {
            'Vital'      => 24,
            'Priorizado' => 48,
            'Simple'     => 72,
            'Solicitud'  => 48,
            default      => 24,
        };

        return $base->copy()->addHours($hours)->toDateTimeString();
    }


    protected $appends = [
        'deadline_ciudadano',
    ];

    public function seguimientos()
    {
        return $this->hasMany(PqrSeguimiento::class);
    }
    public function clasificaciones()
    {
        return $this->belongsToMany(Clasificacion::class, 'clasificacion_pqr', 'pqr_id', 'clasificacion_id');
    }

    public function eventLogs()
    {
        return $this->hasMany(EventLog::class, 'pqr_codigo', 'pqr_codigo')->orderBy('created_at', 'desc');
    }
}
