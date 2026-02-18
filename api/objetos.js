const db = require('./database');
const express = require('express');
const router = express.Router();

// 1. GET: Obtener todos los objetos
router.get('/', async (req, res) => {
    try {
        // Ejecuta M3_LISTAR_OBJETOS(p_estado). Pasamos NULL para ver todos.
        const [results] = await db.query('CALL M3_LISTAR_OBJETOS(NULL)');
        
        if (!results[0] || results[0].length === 0) {
            return res.status(404).json({ error: 'No se encontraron objetos' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener objetos:', err);
        return res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// 2. POST: Crear un nuevo objeto
router.post('/', async (req, res) => {
    const { nom_objeto, desc_objeto, url_objeto, estado_objeto } = req.body;

    if (!nom_objeto) {
        return res.status(400).json({ error: 'El nombre del objeto es obligatorio' });
    }

    try {
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_INSERTAR_OBJETO(?, ?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado AS resultado, @p_mensaje AS mensaje;
        `;

        const [results] = await db.query(sql, [
            nom_objeto, 
            desc_objeto || '', 
            url_objeto || '', 
            estado_objeto || 1
        ]);

        const respuesta = results[3][0];

        if (respuesta.resultado > 0) {
            res.status(201).json({ 
                message: 'Objeto creado exitosamente', 
                codObjeto: respuesta.resultado, 
                detalle: respuesta.mensaje 
            });
        } else {
            res.status(400).json({ error: 'Error al crear el objeto', detalle: respuesta.mensaje });
        }
    } catch (err) {
        console.error('Error en POST objeto:', err);
        return res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
    }
});

// 3. PUT: Actualizar un objeto existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nom_objeto, desc_objeto, url_objeto, estado_objeto } = req.body;

    try {
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ACTUALIZAR_OBJETO(?, ?, ?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado AS resultado, @p_mensaje AS mensaje;
        `;

        const [results] = await db.query(sql, [
            id, 
            nom_objeto, 
            desc_objeto, 
            url_objeto, 
            estado_objeto
        ]);

        const respuesta = results[3][0];

        if (respuesta.resultado > 0) {
            res.status(200).json({ message: 'Objeto actualizado exitosamente', detalle: respuesta.mensaje });
        } else {
            res.status(400).json({ error: 'Error al actualizar el objeto', detalle: respuesta.mensaje });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error en el SP', detalle: err.message });
    }
});

// 4. DELETE: Eliminar un objeto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ELIMINAR_OBJETO(?, @p_resultado, @p_mensaje);
            SELECT @p_resultado AS resultado, @p_mensaje AS mensaje;
        `;

        const [results] = await db.query(sql, [id]);
        const respuesta = results[3][0];

        if (respuesta.resultado > 0) {
            res.status(200).json({ message: 'Objeto eliminado exitosamente', detalle: respuesta.mensaje });
        } else {
            res.status(400).json({ error: 'No se pudo eliminar el objeto', detalle: respuesta.mensaje });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error al ejecutar eliminación', detalle: err.message });
    }
});

module.exports = router;