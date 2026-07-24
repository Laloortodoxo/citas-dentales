const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/db');

const citasRoutes = require('./routes/citasRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/citas', citasRoutes);

app.get('/', (req, res) => {
  res.send('API de Citas Dentales funcionando correctamente');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en http://localhost:${PORT}`);
});