const express = require('express');
const cors = require('cors');
const catalogoRoutes = require('./Modulo_Catalogo');
const pedidosRoutes = require('./pedidos'); // Importas el archivo que creamos
const reportesRoutes = require('./reportes'); // Importas el archivo que creamos
const personasRoutes = require('./Modulo_Personas'); // Importas el archivo de personas
const inventarioRoutes = require('./Modulo_Inventario'); // Importas el archivo de inventario
const rolesRoutes = require('./roles'); // Importas el archivo de roles
const objetosRoutes = require('./objetos'); // Importas el archivo de objetos
const permisosRoutes = require('./permisos'); // Importas el archivo de permisos
const usuariosRoutes = require('./usuarios');//     
const bitacoraRoutes = require('./bitacora');
const backupsRoutes = require('./backups');



const app = express();
const PORT = 3000; // Node correrá en el puerto 3000 (Laravel usa el 8000)

// Middlewares (Configuraciones)
app.use(cors()); // Permitir conexiones de todos lados
app.use(express.json()); // Entender JSON que viene del Body

// Rutas
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/pedidos', pedidosRoutes);    // Nueva ruta de Pedidos
app.use('/api/reportes', reportesRoutes);    // Nueva ruta de Reportes
app.use('/api/personas', personasRoutes); // Ruta para personas
app.use('/api/inventario', inventarioRoutes); // Ruta para inventario
app.use('/api/roles', rolesRoutes); // Ruta para roles
app.use('/api/objetos', objetosRoutes); // Ruta para objetos
app.use('/api/permisos', permisosRoutes); // Ruta para permisos
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/backups', backupsRoutes);


// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Node corriendo en http://127.0.0.1:${PORT}`);
});
