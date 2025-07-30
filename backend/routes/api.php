<?php

use App\Http\Controllers\Api\ClasificacionController;
use App\Http\Controllers\Api\PlantillaRespuestaController;
use App\Http\Controllers\Api\PqrController;
use App\Http\Controllers\Api\RespuestaController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UsuarioRespuestaController;
use App\Http\Controllers\Api\FelicitacionController;
use App\Http\Controllers\Api\PqrAlertaController;
use App\Http\Controllers\EncuestaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



// Rutas de autenticación (no requieren token para login/register)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Rutas de PQRS públicas (por ejemplo, para que cualquiera pueda crear una PQR)
Route::post('pqrs', [PqrController::class, 'store']);
Route::post('/pqrs/{id}/solicitar-respuesta', [RespuestaController::class, 'solicitarRespuestaUsuario']);
Route::post('/respuesta-usuario/{token}', [UsuarioRespuestaController::class, 'guardarRespuesta']);
Route::post('/felicitaciones', [FelicitacionController::class, 'store']);
Route::get('/pqrs/alertas-tiempo', [PqrAlertaController::class, 'alertas']);
Route::post('/pqrs/consultar-radicado', [PqrController::class, 'consultarRadicado']);
Route::post('/encuesta', [EncuestaController::class, 'store']);









// RUTAS PROTEGIDAS POR AUTENTICACIÓN Y ROLES ESPECÍFICOS

Route::middleware(['auth:api', 'check.role:Administrador,Supervisor,Gestor,Consultor,Digitador'])->group(function () {

    // Rutas de visualización de PQRS (solo roles autorizados pueden ver la lista o detalles)
    Route::get('pqrs', [PqrController::class, 'index']);
    Route::get('pqrs/codigo/{pqr_codigo}', [PqrController::class, 'show']);
    Route::get('/clasificaciones', [ClasificacionController::class, 'index']);
    Route::get('/pqrs/estado', [PqrController::class, 'filtros_estado_respuesta'])->middleware('auth:api');
    Route::get('/pqrs/{pqr}/clasificaciones', [ClasificacionController::class, 'obtenerClasificacionesPorPqr']);
});

// RUTAS PROTEGIDAS QUE ACTUALIZAN LA PQRS
Route::middleware(['auth:api', 'check.role:Administrador,Gestor,Supervisor'])->group(function () {
    Route::put('pqrs/codigo/{pqr_codigo}', [PqrController::class, 'update']);
    Route::post('/pqrs/{pqr}/agregar-clasificacion', [ClasificacionController::class, 'agregarClasificacion']);
});


// RUTAS DE TODOS LOS ROLES AUTENTICADOS
Route::middleware(['jwt.auth'])->group(function () {
    // Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
    Route::get('/pqrs-asignadas', [PqrController::class, 'asignadas']);
});



// ========================================================================
// RUTAS DE GESTIÓN DE USUARIOS (Generalmente solo para Administradores)
// Estas rutas requieren autenticación, que el usuario esté activo y que tenga el rol de 'Administrador'.
// ========================================================================
Route::middleware(['auth:api', 'check.active', 'check.role:Administrador'])->group(function () {
    // Route::get('users', [UserController::class, 'index']); 
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::put('users/{id}', [UserController::class, 'update']); // Actualizar usuario (Admin)
    Route::delete('users/{id}', [UserController::class, 'destroy']); // Eliminar usuario (Admin)
    Route::post('register-user', [UserController::class, 'store']);
    Route::patch('users/{id}/toggle-active', [UserController::class, 'toggleActive']); // Activar/desactivar usuario
});


// RUTA PARA PODER ASIGNAR USUARIOS a las pqr y dar respuesta
Route::middleware(['auth:api', 'check.active', 'check.role:Administrador,Gestor,Supervisor'])->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::post('/pqrs/codigo/{pqr_codigo}/respuesta', [RespuestaController::class, 'registrarRespuesta']);
    Route::post('/pqrs/codigo/{pqr_codigo}/enviar-respuesta-correo', [RespuestaController::class, 'enviarRespuesta']);
});

Route::middleware(['auth:api', 'check.active', 'check.role:Administrador,Consultor,Supervisor,Gestor,Digitador'])->group(function () {
    Route::get('users', [UserController::class, 'index']);
});

// RUTA PARA RESPUESTA FINAL DE PQR
Route::middleware(['auth:api', 'check.active', 'check.role:Administrador,Gestor,Supervisor'])->group(function () {
    Route::post('/pqrs/codigo/{pqr_codigo}/respuesta-final', [RespuestaController::class, 'registrarRespuestaFinal']);
    Route::get('/plantillas-respuesta', [PlantillaRespuestaController::class, 'index']);
    Route::get('/pqrs/{pqr_codigo}/respuestas', [RespuestaController::class, 'listarRespuestas']);
    Route::put('/pqrs/respuestas/{respuesta}', [RespuestaController::class, 'updateRespuestaFinal']);
    // Route::get('/pqrs/{pqr_codigo}/seguimientos', [PqrController::class, 'obtenerSeguimientos']);
    Route::post('/pqrs/{pqr_codigo}/seguimientos', [PqrController::class, 'registrarSeguimiento']);
});

Route::middleware(['auth:api', 'check.active', 'check.role:Administrador,Gestor,Supervisor,Consultor,Digitador'])->group(function () {
    Route::get('/pqrs/{pqr_codigo}/seguimientos', [PqrController::class, 'obtenerSeguimientos']);
});
