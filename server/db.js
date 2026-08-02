const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos un Pool de conexiones compatible con async / await
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'citas_dentales',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificación inicial de la conexión al arrancar
db.getConnection()
  .then((connection) => {
    console.log('✅ Conectado exitosamente a la base de datos MySQL (Pool Promesas)');
    connection.release(); // Libera la conexión de prueba de vuelta al pool
  })
  .catch((err) => {
    console.error('❌ Error de conexión a la base de datos MySQL:', err.message);
  });

module.exports = db;