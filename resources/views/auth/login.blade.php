@extends('adminlte::auth.login')

@section('auth_header', 'Inicio de Sesión')

@section('auth_body')
    <form action="{{ route('login') }}" method="post">
        @csrf

        {{-- Campo de Usuario --}}
        <div class="input-group mb-3">
            <input type="text" name="USR_USUARIO" class="form-control @error('USR_USUARIO') is-invalid @enderror"
                   value="{{ old('USR_USUARIO') }}" placeholder="Usuario" required autofocus>
            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-user"></span>
                </div>
            </div>
            @error('USR_USUARIO')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
        </div>

        {{-- Campo de Contraseña --}}
        <div class="input-group mb-3">
            <input type="password" name="password" class="form-control @error('password') is-invalid @enderror"
                   placeholder="Contraseña" required>
            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-lock"></span>
                </div>
            </div>
            @error('password')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
        </div>

        {{-- Botón de Ingreso --}}
        <div class="row">
            <div class="col-12">
                <button type="submit" class="btn btn-primary btn-block">
                    <span class="fas fa-sign-in-alt"></span> Entrar
                </button>
            </div>
        </div>
    </form>
@stop