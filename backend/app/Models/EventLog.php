<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventLog extends Model
{
    use HasFactory;

    protected $table = 'event_logs'; // Nombre de la tabla

    protected $fillable = [
        'event_type',
        'description',
        'pqr_id',
        'pqr_codigo',
        'id_pqr_maestra',
        'codigo_pqr_maestra',
        'estado_anterior',
        'estado_nuevo',
        'fecha_evento',
        'user_id',
        'duplicadas',
    ];

    public $timestamps = false;
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    protected $casts = [
        'duplicadas' => 'array', 
    ];
}
