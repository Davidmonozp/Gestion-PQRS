<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Respuesta extends Model
{
    use HasFactory;

    protected $fillable = [
        'pqrs_id',
        'user_id',
        'contenido',
        'es_respuesta_usuario',
        'es_final',
        'adjuntos',
    ];

    protected $casts = [
        'es_final' => 'boolean',
        'adjuntos' => 'array',
    ];

    // Relaciones
    public function pqr()
    {
        return $this->belongsTo(Pqr::class, 'pqrs_id');
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
