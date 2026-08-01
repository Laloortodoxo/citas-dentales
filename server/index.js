const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const citasRoutes = require('./routes/citasRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);

app.get('/', (req, res) => {
  res.send('API DentalCare funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});