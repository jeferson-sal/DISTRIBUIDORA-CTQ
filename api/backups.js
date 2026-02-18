const db = require('./database'); // Conexión centralizada (Pool)
const express = require('express');
const router = express.Router();

// 1. GET: Listar registros de backup
// Permite filtrar por tabla específica y rango de fechas
router.get('/', async (req, res) => {
    try {
        const { tabla, fecha_inicio, fecha_fin } = req.query;

        // El SP espera 3 parámetros: p_tabla, p_fecha_inicio, p_fecha_fin
        const [rows] = await db.query('CALL M3_LISTAR_BACKUPS(?, ?, ?)', [
            tabla || null, 
            fecha_inicio || null, 
            fecha_fin || null
        ]);
        
        if (!rows[0] || rows[0].length === 0) {
            return res.status(404).json({ error: 'No se encontraron registros de backup' });
        }
        res.json(rows[0]); 
    } catch (error) {
        console.error('Error al obtener backups:', error);
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
});

// 2. DELETE: Limpiar backups antiguos (1 IN, 2 OUT)
// Útil para liberar espacio eliminando registros de hace varios meses
router.delete('/limpiar', async (req, res) => {
    try {
        const { dias_antiguedad } = req.body;

        if (!dias_antiguedad || isNaN(dias_antiguedad)) {
            return res.status(400).json({ error: 'Debe especificar los días de antigüedad como un número' });
        }

        // Estructura de parámetros: 1 entrada + 2 salida
        const sql = `
            SET @p_resultado = 0; SET @p_mensaje = '';
            CALL M3_LIMPIAR_BACKUPS(?, @p_resultado, @p_mensaje);
            SELECT @p_resultado as registrosEliminados, @p_mensaje as mensaje;
        `;

        const [results] = await db.query(sql, [dias_antiguedad]);
        
        // Capturamos el resultado del último SELECT (índice 3 en Node)
        const respuesta = results[3][0]; 

        res.json({
            success: true,
            registrosEliminados: respuesta.registrosEliminados,
            detalle: respuesta.mensaje
        });
    } catch (error) {
        console.error('Error al limpiar backups:', error);
        res.status(500).json({ error: 'Error al procesar la limpieza', detalle: error.message });
    }
});

module.exports = router;