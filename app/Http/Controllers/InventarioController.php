<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class InventarioController extends Controller
{
    /**
     * GET /api/inventario
     * Lista todos los productos o filtra por búsqueda/sucursal/stock
     * SP: M5_SELECT_INVENTARIO(NULL, p_busqueda, p_cod_sucursal, p_solo_bajo_stock)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $busqueda = $request->input('busqueda', null);
            $codSucursal = $request->input('codSucursal', null);
            $soloBajoStock = $request->boolean('soloBajoStock') ? 1 : 0;

            // Al ser listado general, el primer parámetro (cod_inventario) va NULL
            $results = DB::select('CALL M5_SELECT_INVENTARIO(NULL, ?, ?, ?)', [
                $busqueda,
                $codSucursal,
                $soloBajoStock
            ]);

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/inventario/{id}
     * Obtiene un solo producto por su código
     * SP: M5_SELECT_INVENTARIO(p_cod_inventario, NULL, NULL, NULL)
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Pasamos el ID como primer parámetro y el resto NULL
            $results = DB::select('CALL M5_SELECT_INVENTARIO(?, NULL, NULL, NULL)', [$id]);

            if (empty($results)) {
                return response()->json(['error' => 'Producto no encontrado'], 404);
            }

            return response()->json($results[0]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/inventario
     * Crea un nuevo registro
     * SP: M5_INSERT_INVENTARIO
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'p_cod_inventario' => 'required',
            'p_nombre_repuesto' => 'required',
            'p_precio_venta' => 'required|numeric'
        ]);

        try {
            // Mapeo exacto de los parámetros del SP M5_INSERT_INVENTARIO
            $params = [
                $request->input('p_cod_inventario'),
                $request->input('p_fk_cod_administrador', null),
                $request->input('p_fk_cod_producto', null),
                $request->input('p_nombre_repuesto'),
                $request->input('p_marca', ''),
                $request->input('p_modelo_celular', ''),
                $request->input('p_stock_actual', 0),
                $request->input('p_stock_minimo', 5),
                $request->input('p_precio_venta'),
                $request->input('p_precio_costo', 0),
                $request->input('p_cod_sucursal', null),
                $request->input('p_nombre_sucursal', null),
                $request->input('p_direccion_sucursal', null)
            ];

            // Ejecutamos y capturamos las variables OUT (@res, @msg)
            DB::statement(
                'CALL M5_INSERT_INVENTARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @res, @msg)',
                $params
            );

            // Leemos el resultado
            $output = DB::select('SELECT @res as resultado, @msg as mensaje')[0];

            if ($output->resultado > 0) {
                return response()->json([
                    'message' => 'Inventario creado exitosamente',
                    'codInventario' => $request->input('p_cod_inventario'),
                    'detalle' => $output->mensaje
                ], 201);
            }

            return response()->json(['error' => $output->mensaje], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/inventario/{id}
     * Actualiza un registro existente
     * SP: M5_UPDATE_INVENTARIO
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $params = [
                $id, // El ID viene de la URL
                $request->input('p_fk_cod_administrador', null),
                $request->input('p_fk_cod_producto', null),
                $request->input('p_nombre_repuesto'),
                $request->input('p_marca', null),
                $request->input('p_modelo_celular', null),
                $request->input('p_stock_actual', null),
                $request->input('p_stock_minimo', null),
                $request->input('p_precio_venta', null),
                $request->input('p_precio_costo', null),
                $request->input('p_cod_sucursal', null),
                $request->input('p_nombre_sucursal', null),
                $request->input('p_direccion_sucursal', null)
            ];

            DB::statement(
                'CALL M5_UPDATE_INVENTARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @res, @msg)',
                $params
            );

            $output = DB::select('SELECT @res as resultado, @msg as mensaje')[0];

            if ($output->resultado > 0) {
                return response()->json([
                    'message' => 'Actualizado exitosamente',
                    'detalle' => $output->mensaje
                ], 200);
            }

            return response()->json(['error' => $output->mensaje], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/inventario/{id}
     * Elimina un registro
     * SP: M5_DELETE_INVENTARIO
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            // Este SP devuelve un result set con columna 'Mensaje', no usa OUT params
            $results = DB::select('CALL M5_DELETE_INVENTARIO(?)', [$id]);
            $mensaje = $results[0]->Mensaje ?? 'Procesado';

            if (str_contains(strtolower($mensaje), 'exitosamente')) {
                return response()->json(['message' => $mensaje], 200);
            }

            return response()->json(['error' => $mensaje], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}