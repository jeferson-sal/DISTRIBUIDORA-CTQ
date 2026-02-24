<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable; // Esto es para el 2FA

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    // 1. Dile a Laravel el nombre real de tu tabla
    protected $table = 'tbl_usuario';

    // 2. Dile cuál es la llave primaria (por defecto es 'id', la tuya es 'COD_USUARIO')
    protected $primaryKey = 'COD_USUARIO';

    // 3. Dile qué columnas se pueden llenar
    protected $fillable = [
        'FK_COD_PERSONA',
        'FK_COD_ROL',
        'USR_USUARIO',
        'PASSWORD_HASH',
        'ESTADO_USUARIO',
    ];

    protected $hidden = [
        'PASSWORD_HASH',
        'remember_token',
    ];

    // 4. IMPORTANTE: Laravel busca la columna 'password'. Como la tuya se llama 'PASSWORD_HASH', hay que avisarle:
    public function getAuthPassword()
    {
        return $this->PASSWORD_HASH;
    }
}