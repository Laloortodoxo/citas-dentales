const express = require('express');
const cors = require('cors'); // <-- Agregar esta línea
require('dotenv').config();

const app = express();

app.use(cors()); // <-- Agregar esta línea (permite que React se conecte)
app.use(express.json());

// Rutas
app.use('/api/citas', require('./routes/citasRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en http://localhost:${PORT}`);
});