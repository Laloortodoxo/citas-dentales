const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas del sistema
app.use('/api/citas', require('./routes/citasRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // <-- Nueva línea

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en http://localhost:${PORT}`);
});