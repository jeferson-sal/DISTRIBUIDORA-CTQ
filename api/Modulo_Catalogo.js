const db = require('./database');
const express = require('express');
const router = express.Router();

// 1. GET: Listar (Igual que tu public function index)
router.get('/', async (req, res) => {
    try {
        // $tabla = $request->query('tabla', 'PRODUCTO');
        const tabla = req.query.tabla || 'PRODUCTO';
        const busqueda = req.query.busqueda || '';

        // DB::select("CALL SELECT_CATALOGO(?, ?)", [$tabla, $busqueda]);
        const [rows] = await db.query('CALL SELECT_CATALOGO(?, ?)', [tabla, busqueda]);
        
        // Laravel devuelve un array limpio, en Node la data viene en rows[0]
        res.json(rows[0]); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 2. POST: Insertar (Igual que tu public function store)
router.post('/', async (req, res) => {
    try {
        const { tabla, fk_marca, fk_categoria, nombre, descripcion, estado } = req.body;

        // FÍJATE EN EL ORDEN: Es idéntico a tu PHP.
        // PHP: $tabla, $fk_marca, $fk_categoria, $nombre, $descripcion, $estado
        const sql = `
            SET @res = 0; SET @msj = '';
            CALL INSERT_CATALOGO(?, ?, ?, ?, ?, ?, @res, @msj);
            SELECT @res as id, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [
            tabla,
            fk_marca || null,     // p_fk_marca
            fk_categoria || null, // p_fk_categoria
            nombre,               // p_nombre
            descripcion,          // p_descripcion
            estado || 1           // p_estado
        ]);

        // En results, el índice [0] y [1] son los SET, el [2] es el CALL, el [3] es el SELECT final
        // Queremos el resultado del SELECT (el último)
        const respuesta = results[3][0]; 

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 3. DELETE: Eliminar (Igual que tu public function destroy)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tabla = req.query.tabla || 'PRODUCTO';

        // PHP: CALL DELETE_CATALOGO(?, ?, @res, @msj)
        const sql = `
            SET @res = 0; SET @msj = '';
            CALL DELETE_CATALOGO(?, ?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [tabla, id]);
        
        // Tomamos la respuesta del último SELECT
        const respuesta = results[3][0]; 

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT: Actualizar (Igual que tu public function update)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { tabla, fk_marca, fk_categoria, nombre, descripcion, estado } = req.body;

        // PHP: $tabla, $id, $fk_marca, $fk_categoria, $nombre, $descripcion, $estado
        const sql = `
            SET @res = 0; SET @msj = '';
            CALL UPDATE_CATALOGO(?, ?, ?, ?, ?, ?, ?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [
            tabla,
            id,                   // p_codigo
            fk_marca || null,     // p_fk_marca
            fk_categoria || null, // p_fk_categoria
            nombre,               // p_nombre
            descripcion,          // p_descripcion
            estado || 1           // p_estado
        ]);

        const respuesta = results[3][0]; 

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;