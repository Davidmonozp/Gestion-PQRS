<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Spatie\Permission\Exceptions\UnauthorizedException;

class CheckRoleAccess
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user() || ! $request->user()->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Este rol no tiene permisos para acceder a esta vista.'
            ], 403);
        }

        return $next($request);
    }
}