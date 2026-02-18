const db = require('./database'); // Importamos la conexión centralizada
const express = require('express');
const router = express.Router();

// Ruta GET para obtener roles
router.get('/', async (req, res) => {
    try {
        const busqueda = req.query.busqueda || null; // Soporte para búsqueda si el SP lo requiere
        const [results] = await db.query('CALL M3_LISTAR_ROLES', [busqueda]);
        
        if (!results[0] || results[0].length === 0) {
            return res.status(404).json({ error: 'No se encontraron roles' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al ejecutar el procedimiento:', err);
        return res.status(500).json({ error: 'Error al obtener roles' });
    }
});

// Ruta POST para crear un nuevo rol
router.post('/', async (req, res) => {
    console.log('=== DEBUG POST ROL ===');
    console.log('Body recibido:', req.body);
    const { nom_rol, descripcion } = req.body;

    if (!nom_rol) {
        return res.status(400).json({ error: 'El nombre del rol es obligatorio' });
    }

    try {
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_INSERTAR_ROL(?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado AS resultado, @p_mensaje AS mensaje;
        `;

        const [results] = await db.query(sql, [nom_rol, descripcion]);
        const { resultado, mensaje } = results[3][0]; // Captura desde el SELECT final

        if (resultado > 0) {
            res.status(201).json({ message: 'Rol creado exitosamente', codRol: resultado, detalle: mensaje });
        } else {
            res.status(400).json({ error: 'Error al crear el rol', detalle: mensaje });
        }
    } catch (err) {
        console.error('Error al crear el rol:', err);
        return res.status(500).json({ error: 'Error en el SP', detalle: err.message });
    }
});

// Ruta PUT para actualizar un rol existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nom_rol, descripcion } = req.body;

    try {
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ACTUALIZAR_ROL(?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado AS resultado, @p_mensaje AS mensaje;
        `;

        const [results] = await db.query(sql, [id, nom_rol, descripcion]);
        const { resultado, mensaje } = results[3][0];

        if (resultado > 0) {
            res.status(200).json({ message: 'Rol actualizado exitosamente', detalle: mensaje });
        } else {
            res.status(400).json({ error: 'Error al actualizar el rol', detalle: mensaje });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error en el SP', detalle: err.message });
    }
});

// Ruta DELETE para eliminar un rol
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ELIMINAR_ROL(?, @p_resultado, @p_mensaje);
            SELECT @p_resultado AS resultado, @p_mensaje AS mensaje;
        `;

        const [results] = await db.query(sql, [id]);
        const { resultado, mensaje } = results[3][0];

        if (resultado > 0) {
            res.status(200).json({ message: 'Rol eliminado exitosamente', detalle: mensaje });
        } else {
            res.status(400).json({ error: 'No se pudo eliminar el rol', detalle: mensaje });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error en el SP', detalle: err.message });
    }
});

module.exports = router;