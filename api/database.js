const mysql = require('mysql2');

// Crear la conexión (Asegúrate que la contraseña sea correcta, en XAMPP suele ser vacía)
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '', 
    database: 'distribuidora', // Tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true // Esto es importante para ejecutar múltiples consultas (como CALL)
});

// Convertir a promesas para poder usar async/await (más moderno y limpio)
const promisePool = pool.promise();

module.exports = promisePool;