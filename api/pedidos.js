const db = require('./database'); // Referencia a tu archivo de conexión
const express = require('express');
const router = express.Router();

// 1. GET: Consultar Pedidos (Igual que index en Laravel)
router.get('/', async (req, res) => {
    try {
        const id = req.query.id || null;
        const cliente = req.query.cliente || null;
        const estado = req.query.estado || null;
        const fecha_inicio = req.query.fecha_inicio || null;
        const fecha_fin = req.query.fecha_fin || null;

        // Llamada al procedimiento SELECT_PEDIDO
        const [rows] = await db.query('CALL SELECT_PEDIDO(?, ?, ?, ?, ?)', [
            id, cliente, estado, fecha_inicio, fecha_fin
        ]);

        // Si se busca por ID, el SP suele devolver el encabezado en la primera tabla
        // y el detalle en la segunda tabla (si está configurado así)
        if (id && rows[0].length > 0) {
            return res.json({
                pedido: rows[0][0],
                detalle: rows[1] || [] // En Node, los sets adicionales vienen como índices del array
            });
        }

        res.json(rows[0]); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 2. POST: Insertar Pedido (Igual que store en Laravel)
router.post('/', async (req, res) => {
    try {
        const { cod_cliente, tipo_pedido, estado_pedido, detalles } = req.body;
        
        // Convertimos el array de detalles a String JSON igual que json_encode en PHP
        const detallesJSON = JSON.stringify(detalles);

        const sql = `
            SET @res = 0; SET @msj = '';
            CALL INSERT_PEDIDO(?, ?, ?, ?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [
            cod_cliente || null,
            tipo_pedido,
            estado_pedido || 'PENDIENTE',
            detallesJSON
        ]);

        // Según tu referencia: results[3] es el resultado del SELECT final
        const respuesta = results[3][0];

        if (respuesta.resultado === 0) {
            return res.status(400).json({
                exito: false,
                mensaje: respuesta.mensaje
            });
        }

        res.status(201).json({
            exito: true,
            cod_pedido: respuesta.resultado,
            mensaje: respuesta.mensaje
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 3. PUT: Actualizar Pedido (Igual que update en Laravel)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cod_cliente, tipo_pedido, estado_pedido } = req.body;

        const sql = `
            SET @res = 0; SET @msj = '';
            CALL UPDATE_PEDIDO(?, ?, ?, ?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [
            id,
            cod_cliente || null,
            tipo_pedido,
            estado_pedido
        ]);

        const respuesta = results[3][0];

        if (respuesta.resultado === 0) {
            return res.status(400).json(respuesta);
        }

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Eliminar Pedido (Igual que destroy en Laravel)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SET @res = 0; SET @msj = '';
            CALL DELETE_PEDIDO(?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [id]);

        const respuesta = results[3][0];

        if (respuesta.resultado === 0) {
            return res.status(400).json(respuesta);
        }

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;