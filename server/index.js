const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares obligatorios (deben ir ANTES de declarar las rutas)
app.use(cors());
app.use(express.json());

// Importación de rutas de tu proyecto
const authRoutes = require('./routes/authRoutes');
const citasRoutes = require('./routes/citasRoutes');

// Registro de endpoints
app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API DentalCare funcionando 🚀');
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});