const db = require('./database'); // Conexión centralizada (Pool)
const express = require('express');
const router = express.Router();

// 1. GET: Listar permisos (con filtro opcional por rol)
router.get('/', async (req, res) => {
    try {
        const { cod_rol } = req.query;
        // Se utiliza el nombre del procedimiento según el router proporcionado
        const [rows] = await db.query('CALL M3_LISTAR_PERMISOS(?)', [cod_rol || null]);
        
        if (!rows[0] || rows[0].length === 0) {
            return res.status(404).json({ error: 'No se encontraron permisos' });
        }
        res.json(rows[0]); 
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ error: 'Error al obtener permisos', detalle: error.message });
    }
});

// 2. POST: Insertar un nuevo permiso (7 IN, 2 OUT)
router.post('/', async (req, res) => {
    try {
        const { 
            fk_cod_rol, fk_cod_objeto, estado_permiso, 
            per_select, per_insertar, per_update, per_delete 
        } = req.body;

        if (!fk_cod_rol || !fk_cod_objeto) {
            return res.status(400).json({ error: 'El rol y el objeto son obligatorios' });
        }

        // Estructura idéntica al Modulo_Catalogo para manejar variables de salida
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_INSERTAR_PERMISO(?, ?, ?, ?, ?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado as resultado, @p_mensaje as mensaje;
        `;

        const [results] = await db.query(sql, [
            fk_cod_rol, 
            fk_cod_objeto, 
            estado_permiso || 1, 
            per_select || '0', 
            per_insertar || '0', 
            per_update || '0', 
            per_delete || '0'
        ]);

        // Capturamos el resultado del SELECT final (índice 3)
        const respuesta = results[3][0]; 

        if (respuesta.resultado > 0) {
            res.status(201).json({ 
                message: 'Permiso creado exitosamente', 
                codPermiso: respuesta.resultado, 
                detalle: respuesta.mensaje 
            });
        } else {
            res.status(400).json({ error: 'Error al crear el permiso', detalle: respuesta.mensaje });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    }
});

// 3. PUT: Actualizar permiso existente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            fk_cod_rol, fk_cod_objeto, estado_permiso, 
            per_select, per_insertar, per_update, per_delete 
        } = req.body;

        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ACTUALIZAR_PERMISO(?, ?, ?, ?, ?, ?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado as resultado, @p_mensaje as mensaje;
        `;

        const [results] = await db.query(sql, [
            id, fk_cod_rol, fk_cod_objeto, estado_permiso, 
            per_select, per_insertar, per_update, per_delete
        ]);

        const respuesta = results[3][0]; 
        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Eliminar un permiso
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ELIMINAR_PERMISO(?, @p_resultado, @p_mensaje);
            SELECT @p_resultado as resultado, @p_mensaje as mensaje;
        `;

        const [results] = await db.query(sql, [id]);
        const respuesta = results[3][0]; 

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;