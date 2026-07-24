const db = require('../config/db');

// Obtener todas las citas
exports.obtenerCitas = (req, res) => {
  const query = 'SELECT * FROM citas';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error MySQL (GET):', err);
      return res.status(500).json({ error: 'Error al obtener las citas' });
    }
    res.json(results);
  });
};

// Crear una nueva cita
exports.crearCita = (req, res) => {
  const { paciente_id, servicio, fecha_cita, hora_cita } = req.body;
  if (!paciente_id || !servicio || !fecha_cita || !hora_cita) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const query = 'INSERT INTO citas (paciente_id, servicio, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
  db.query(query, [paciente_id, servicio, fecha_cita, hora_cita], (err, result) => {
    if (err) {
      console.error('⚠️ Detalle del error de MySQL:', err.sqlMessage || err); // <-- Imprime el motivo exacto
      return res.status(500).json({ error: 'Error al registrar la cita' });
    }
    res.status(201).json({ message: 'Cita agendada exitosamente', id: result.insertId });
  });
};