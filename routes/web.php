<?php

use Illuminate\Support\Facades\Route;

// Redirige la raíz al login para probar directo
Route::get('/', function () {
    return view('auth.login');
});

// COMENTA ESTA LÍNEA (ya que Fortify maneja sus propias rutas)
// Auth::routes(); 

// Asegúrate de que esta ruta apunte a tu vista home.blade.php
Route::get('/home', function () {
    return view('home');
})->middleware(['auth'])->name('home');