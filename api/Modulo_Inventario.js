const db = require('./database');
const express = require('express');
const router = express.Router();

// 1. GET: Listar todo el inventario o filtrar
router.get('/', async (req, res) => {
    try {
        const busqueda = req.query.busqueda || null;
        const codSucursal = req.query.codSucursal || null;
        const soloBajoStock = req.query.soloBajoStock === 'true' ? 1 : 0;

        // SP: M5_SELECT_INVENTARIO(cod_inventario, busqueda, sucursal, bajo_stock)
        const [rows] = await db.query('CALL M5_SELECT_INVENTARIO(NULL, ?, ?, ?)', [
            busqueda, 
            codSucursal, 
            soloBajoStock
        ]);
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Obtener un producto específico por su código
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('CALL M5_SELECT_INVENTARIO(?, NULL, NULL, NULL)', [id]);
        
        if (!rows[0] || rows[0].length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0][0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. POST: Insertar nuevo inventario
router.post('/', async (req, res) => {
    try {
        const {
            p_cod_inventario, p_fk_cod_administrador, p_fk_cod_producto,
            p_nombre_repuesto, p_marca, p_modelo_celular, p_stock_actual,
            p_stock_minimo, p_precio_venta, p_precio_costo, p_cod_sucursal,
            p_nombre_sucursal, p_direccion_sucursal
        } = req.body;

        const sql = `
            SET @res = 0; SET @msg = '';
            CALL M5_INSERT_INVENTARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @res, @msg);
            SELECT @res as resultado, @msg as mensaje;
        `;

        const [results] = await db.query(sql, [
            p_cod_inventario, p_fk_cod_administrador || null, p_fk_cod_producto || null,
            p_nombre_repuesto, p_marca || '', p_modelo_celular || '', p_stock_actual || 0,
            p_stock_minimo || 5, p_precio_venta, p_precio_costo || 0, p_cod_sucursal || null,
            p_nombre_sucursal || null, p_direccion_sucursal || null
        ]);

        // Capturamos el resultado del SELECT final (índice 3 debido a los SET y CALL)
        const respuesta = results[3][0];
        res.json(respuesta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT: Actualizar inventario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            p_fk_cod_administrador, p_fk_cod_producto, p_nombre_repuesto,
            p_marca, p_modelo_celular, p_stock_actual, p_stock_minimo,
            p_precio_venta, p_precio_costo, p_cod_sucursal,
            p_nombre_sucursal, p_direccion_sucursal
        } = req.body;

        const sql = `
            SET @res = 0; SET @msg = '';
            CALL M5_UPDATE_INVENTARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @res, @msg);
            SELECT @res as resultado, @msg as mensaje;
        `;

        const [results] = await db.query(sql, [
            id, p_fk_cod_administrador || null, p_fk_cod_producto || null,
            p_nombre_repuesto, p_marca || null, p_modelo_celular || null, 
            p_stock_actual || null, p_stock_minimo || null, p_precio_venta || null, 
            p_precio_costo || null, p_cod_sucursal || null, p_nombre_sucursal || null, 
            p_direccion_sucursal || null
        ]);

        const respuesta = results[3][0];
        res.json(respuesta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. DELETE: Eliminar de inventario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Este SP devuelve un result set directo, no usa parámetros OUT
        const [rows] = await db.query('CALL M5_DELETE_INVENTARIO(?)', [id]);
        
        // El SP devuelve una columna llamada 'Mensaje'
        res.json({ mensaje: rows[0][0].Mensaje });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;