const express = require('express');
const cors = require('cors');
const catalogoRoutes = require('./Modulo_Catalogo');
const pedidosRoutes = require('./pedidos'); // Importas el archivo que creamos
const reportesRoutes = require('./reportes'); // Importas el archivo que creamos



// const personasRoutes = require('./Modulo_personas'); // Así agregarás el de tu compañero

const app = express();
const PORT = 3000; // Node correrá en el puerto 3000 (Laravel usa el 8000)

// Middlewares (Configuraciones)
app.use(cors()); // Permitir conexiones de todos lados
app.use(express.json()); // Entender JSON que viene del Body

// Rutas
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/pedidos', pedidosRoutes);    // Nueva ruta de Pedidos
app.use('/api/reportes', reportesRoutes);    // Nueva ruta de Reportes


// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Node corriendo en http://127.0.0.1:${PORT}`);
});
