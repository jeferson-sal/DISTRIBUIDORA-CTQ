<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
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
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

       
        RateLimiter::for('login', function (Request $request) {
        // Cambiamos Fortify::username() por el nombre de tu campo real
         $throttleKey = Str::transliterate(Str::lower($request->input('USR_USUARIO')).'|'.$request->ip());

         return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        Fortify::authenticateUsing(function (Request $request) {
        // 1. Buscar al usuario
        $user = \App\Models\User::where('USR_USUARIO', $request->USR_USUARIO)->first();
        // 2. Validar que el usuario exista Y que la contraseña coincida
        if ($user && \Illuminate\Support\Facades\Hash::check($request->password, $user->PASSWORD_HASH)) {
            return $user; // Éxito
        }
        // 3. Si algo falla, devolver null (esto evita que entre cualquiera)
        return null; 
    });
        // 2. Asegúrate de que use la vista de Login de AdminLTE
        Fortify::loginView(function () {
            return view('auth.login');
        });
    }
}
