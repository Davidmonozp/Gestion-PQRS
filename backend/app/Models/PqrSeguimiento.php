<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PqrSeguimiento extends Model
{
    use HasFactory;

    protected $fillable = ['pqr_id', 'user_id', 'descripcion'];

    public function pqr()
    {
        return $this->belongsTo(Pqr::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

