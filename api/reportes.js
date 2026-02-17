const db = require('./database'); // Importa el pool con promesas
const express = require('express');
const router = express.Router();

// 1. GET: Consultar Reportes (Operación SELECT)
router.get('/', async (req, res) => {
    try {
        const { tipo, cod_reporte, fecha_inicio, fecha_fin, cod_sucursal, codigo, limite, agrupar_por } = req.query;

        // Llamada al procedimiento SP_REPORTES con 12 parámetros
        const [rows] = await db.query('CALL SP_REPORTES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            'SELECT',
            cod_reporte || null,
            null, // p_nombre_reporte
            null, // p_descripcion
            tipo || null,
            fecha_inicio || null,
            fecha_fin || null,
            cod_sucursal || null,
            codigo || null,
            limite || null,
            agrupar_por || null,
            null  // p_usuario
        ]);

        res.json(rows[0]); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 2. POST: Guardar/Generar Reporte (Operación INSERT)
router.post('/', async (req, res) => {
    try {
        const { tipo_reporte, nombre_reporte, descripcion, fecha_inicio, fecha_fin, cod_sucursal, codigo, limite, agrupar_por, usuario } = req.body;

        if (!tipo_reporte) {
            return res.status(400).json({ error: 'El campo tipo_reporte es obligatorio' });
        }

        const [rows] = await db.query('CALL SP_REPORTES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            'INSERT',
            null, // p_cod_reporte
            nombre_reporte || null,
            descripcion || null,
            tipo_reporte,
            fecha_inicio || null,
            fecha_fin || null,
            cod_sucursal || null,
            codigo || null,
            limite || null,
            agrupar_por || null,
            usuario || 'SISTEMA'
        ]);

        res.status(201).json({
            exito: true,
            mensaje: 'Reporte generado y guardado exitosamente',
            datos: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 3. PUT: Actualizar Reporte Guardado (Operación UPDATE)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_reporte, descripcion } = req.body;

        const [rows] = await db.query('CALL SP_REPORTES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            'UPDATE',
            id,
            nombre_reporte || null,
            descripcion || null,
            null, null, null, null, null, null, null, null
        ]);

        const respuesta = rows[0][0];
        if (respuesta.ERROR) return res.status(400).json({ error: respuesta.ERROR });

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Eliminar Reporte (Operación DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query('CALL SP_REPORTES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            'DELETE',
            id,
            null, null, null, null, null, null, null, null, null, null
        ]);

        const respuesta = rows[0][0];
        if (respuesta.ERROR) return res.status(400).json({ error: respuesta.ERROR });

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;