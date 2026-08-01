const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'citas-dentales'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos MySQL:', err.message);
    return;
  }
  console.log('🗄️ Conectado exitosamente a la base de datos MySQL');
});

module.exports = db;