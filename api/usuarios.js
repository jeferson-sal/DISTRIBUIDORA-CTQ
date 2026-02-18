const db = require('./database'); // Conexión centralizada
const express = require('express');
const router = express.Router();

// 1. GET: Listar usuarios (con filtro opcional por estado)
router.get('/', async (req, res) => {
    try {
        const { estado } = req.query;
        // Llama al procedimiento con el estado o null para ver todos
        const [rows] = await db.query('CALL M3_LISTAR_USUARIOS(?)', [estado || null]);
        
        if (!rows[0] || rows[0].length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios' });
        }
        res.json(rows[0]); 
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios', detalle: error.message });
    }
});

// 2. POST: Insertar un nuevo usuario (5 IN, 2 OUT)
router.post('/', async (req, res) => {
    try {
        const { fk_cod_persona, fk_cod_rol, usr_usuario, password_hash, estado_usuario } = req.body;

        if (!usr_usuario || !password_hash) {
            return res.status(400).json({ error: 'El nombre de usuario y la contraseña son obligatorios' });
        }

        // Estructura de 7 parámetros totales según el procedimiento
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_INSERTAR_USUARIO(?, ?, ?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado as resultado, @p_mensaje as mensaje;
        `;

        const [results] = await db.query(sql, [
            fk_cod_persona, 
            fk_cod_rol, 
            usr_usuario, 
            password_hash, 
            estado_usuario || 1
        ]);

        // Capturamos el resultado del SELECT final (índice 3)
        const respuesta = results[3][0]; 

        if (respuesta.resultado > 0) {
            res.status(201).json({ 
                message: 'Usuario creado exitosamente', 
                codUsuario: respuesta.resultado, 
                detalle: respuesta.mensaje 
            });
        } else {
            res.status(400).json({ error: 'Error al crear el usuario', detalle: respuesta.mensaje });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    }
});

// 3. PUT: Actualizar usuario existente (6 IN, 2 OUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fk_cod_persona, fk_cod_rol, usr_usuario, password_hash, estado_usuario } = req.body;

        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ACTUALIZAR_USUARIO(?, ?, ?, ?, ?, ?, @p_resultado, @p_mensaje);
            SELECT @p_resultado as resultado, @p_mensaje as mensaje;
        `;

        const [results] = await db.query(sql, [
            id, 
            fk_cod_persona, 
            fk_cod_rol, 
            usr_usuario, 
            password_hash, 
            estado_usuario
        ]);

        const respuesta = results[3][0]; 
        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_ELIMINAR_USUARIO(?, @p_resultado, @p_mensaje);
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