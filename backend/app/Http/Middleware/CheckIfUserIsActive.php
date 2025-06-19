<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckIfUserIsActive
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && !Auth::user()->activo) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        return $next($request);
    }
}