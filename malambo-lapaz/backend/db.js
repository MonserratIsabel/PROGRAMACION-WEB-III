const mysql = require('mysql2');

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: 'localhost',      // Si usas XAMPP es 'localhost'
    user: 'root',           // Usuario de MySQL (XAMPP: 'root')
    password: '',           // Contraseña (XAMPP: vacío '')
    database: 'malambo_lapaz',  // Nombre de la base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERROR de conexión a MySQL:');
        console.error('   ', err.message);
        console.log('\n   📌 Soluciones:');
        console.log('   1. ¿XAMPP está encendido? (Apache y MySQL)');
        console.log('   2. ¿La base de datos "malambo_lapaz" existe?');
        console.log('   3. ¿Usuario y contraseña son correctos?');
    } else {
        console.log('✅ Conectado a MySQL - Base de datos: malambo_lapaz');
        connection.release();
    }
});

// Convertir a promesas para usar async/await
module.exports = pool.promise();