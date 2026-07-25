const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',        // <-- Si DB_USER falla, usa 'root'
  password: process.env.DB_PASSWORD || '',    // <-- Laragon por defecto no tiene contraseña
  database: process.env.DB_NAME || 'citas_dentales'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a la BD:', err);
    return;
  }
  console.log('✅ Conectado exitosamente a la base de datos MySQL');
});

module.exports = db;