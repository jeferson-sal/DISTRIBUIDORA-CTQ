<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\InventarioController;




// Esto crea automáticamente las rutas para GET, POST, PUT y DELETE
Route::apiResource('personas', PersonaController::class);
Route::apiResource('inventario', InventarioController::class);
