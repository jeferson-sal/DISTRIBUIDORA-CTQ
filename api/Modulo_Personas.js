const db = require('./database');
const express = require('express');
const router = express.Router();

// 1. GET: Listar todas las personas o buscar por texto
router.get('/', async (req, res) => {
    try {
        const busqueda = req.query.busqueda || null;
        
        // CALL SELECT_PERSONA(p_cod_persona, p_busqueda)
        const [rows] = await db.query('CALL SELECT_PERSONA(?, ?)', [null, busqueda]);
        
        // En Node con mysql2, la data del SP viene en rows[0]
        res.json(rows[0]); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Obtener una persona específica por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('CALL SELECT_PERSONA(?, ?)', [id, null]);
        
        if (!rows[0] || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'Persona no encontrada' });
        }
        
        res.json(rows[0][0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 3. POST: Crear nueva persona (Transaccional)
router.post('/', async (req, res) => {
    try {
        const { 
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
            tipo_genero, correo, tipo_correo, num_telefono, tipo_telefono, 
            departamento, municipio, ciudad, colonia, referencia 
        } = req.body;

        const sql = `
            SET @res = 0; SET @msj = '';
            CALL INSERT_PERSONA(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @res, @msj);
            SELECT @res as id, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [
            primer_nombre, segundo_nombre || null, primer_apellido, segundo_apellido || null,
            tipo_genero, correo || null, tipo_correo || null, num_telefono || null, tipo_telefono || null,
            departamento || null, municipio || null, ciudad || null, colonia || null, referencia || null
        ]);

        const respuesta = results[3][0]; 
        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT: Actualizar persona existente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
            tipo_genero, cod_correo, correo, tipo_correo, cod_telefono, 
            num_telefono, tipo_telefono, cod_direccion, departamento, 
            municipio, ciudad, colonia, referencia 
        } = req.body;

        const sql = `
            SET @res = 0; SET @msj = '';
            CALL UPDATE_PERSONA(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
        `;

        const [results] = await db.query(sql, [
            id, primer_nombre, segundo_nombre || null, primer_apellido, segundo_apellido || null,
            tipo_genero, cod_correo || 0, correo || null, tipo_correo || null, 
            cod_telefono || 0, num_telefono || null, tipo_telefono || null,
            cod_direccion || 0, departamento || null, municipio || null, 
            ciudad || null, colonia || null, referencia || null
        ]);

        const respuesta = results[3][0]; 
        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 5. DELETE: Eliminar persona
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SET @res = 0; SET @msj = '';
            CALL DELETE_PERSONA(?, @res, @msj);
            SELECT @res as resultado, @msj as mensaje;
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