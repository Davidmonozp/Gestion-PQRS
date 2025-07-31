<?php

namespace App\Providers;

use App\Models\Pqr;
use App\Models\Respuesta;
use App\Observers\PqrObserver;
use App\Observers\RespuestaObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        Pqr::observe(PqrObserver::class);

        Respuesta::observe(RespuestaObserver::class);
    }
}
