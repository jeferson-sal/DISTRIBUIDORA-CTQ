<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonaController extends Controller
{
    /**
     * GET: Obtener todas las personas o buscar por texto
     */
    public function index(Request $request)
    {
        $busqueda = $request->query('busqueda', null);
        
        // Ejecuta SELECT_PERSONA(p_cod_persona, p_busqueda)
        // Pasamos null en el primer parámetro para que liste todos o busque por texto
        $personas = DB::select('CALL SELECT_PERSONA(?, ?)', [null, $busqueda]);
        
        return response()->json($personas);
    }

    /**
     * GET: Obtener una persona específica por ID
     */
    public function show($id)
    {
        $persona = DB::select('CALL SELECT_PERSONA(?, ?)', [$id, null]);
        
        if (empty($persona)) {
            return response()->json(['mensaje' => 'Persona no encontrada'], 404);
        }
        
        return response()->json($persona[0]);
    }

    /**
     * POST: Crear nueva persona (Transaccional vía SP)
     */
    public function store(Request $request)
    {
        // Los parámetros coinciden con tu procedimiento INSERT_PERSONA
        $params = [
            $request->primer_nombre,
            $request->segundo_nombre,
            $request->primer_apellido,
            $request->segundo_apellido,
            $request->tipo_genero,
            $request->correo,
            $request->tipo_correo,
            $request->num_telefono,
            $request->tipo_telefono,
            $request->departamento,
            $request->municipio,
            $request->ciudad,
            $request->colonia,
            $request->referencia
        ];

        // Ejecutar y obtener parámetros de salida (OUT)
        return $this->callProcedure('INSERT_PERSONA', $params, 14);
    }

    /**
     * PUT: Actualizar persona existente
     */
    public function update(Request $request, $id)
    {
        $params = [
            $id, // p_cod_persona
            $request->primer_nombre,
            $request->segundo_nombre,
            $request->primer_apellido,
            $request->segundo_apellido,
            $request->tipo_genero,
            $request->cod_correo,
            $request->correo,
            $request->tipo_correo,
            $request->cod_telefono,
            $request->num_telefono,
            $request->tipo_telefono,
            $request->cod_direccion,
            $request->departamento,
            $request->municipio,
            $request->ciudad,
            $request->colonia,
            $request->referencia
        ];

        return $this->callProcedure('UPDATE_PERSONA', $params, 18);
    }

    /**
     * DELETE: Eliminar persona
     */
    public function destroy($id)
    {
        return $this->callProcedure('DELETE_PERSONA', [$id], 1);
    }

    /**
     * Función auxiliar para capturar parámetros OUT de los SP
     */
    private function callProcedure($procedureName, $params, $paramCount)
    {
        // Preparamos los placeholders (?) para los parámetros de entrada y (X) para los OUT
        $placeholders = implode(',', array_fill(0, $paramCount, '?'));
        $sql = "CALL {$procedureName}({$placeholders}, @p_resultado, @p_mensaje)";
        
        DB::statement($sql, $params);
        
        $output = DB::select('SELECT @p_resultado AS resultado, @p_mensaje AS mensaje')[0];

        if ($output->resultado == 0) {
            return response()->json(['error' => $output->mensaje], 400);
        }

        return response()->json([
            'mensaje' => $output->mensaje,
            'id' => $output->resultado
        ]);
    }
}