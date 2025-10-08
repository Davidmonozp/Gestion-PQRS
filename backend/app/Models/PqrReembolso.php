<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PqrReembolso extends Model
{
    use HasFactory;

    protected $table = 'pqr_reembolsos';

    protected $fillable = [
        'pqr_id',
        'aprobado_por',
        'estado',
        'comentario',
    ];

    // Relación con la PQR
    public function pqr()
    {
        return $this->belongsTo(Pqr::class, 'pqr_id');
    }

    // Relación con el usuario que aprobó/desaprobó
    public function usuario()
    {
        return $this->belongsTo(User::class, 'aprobado_por', 'id');
    }
}
