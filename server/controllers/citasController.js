const db = require('../config/db');

// Obtener todas las citas
exports.obtenerCitas = (req, res) => {
  const query = 'SELECT * FROM citas';
  db.query(query, (err, results) => {
    if (err) {
      console.log('❌ Error MySQL GET:', err.sqlMessage || err);
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
      console.log('❌ Error exacto de MySQL:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al registrar la cita' });
    }
    res.status(201).json({ message: 'Cita agendada exitosamente', id: result.insertId });
  });
};

// Eliminar una cita
exports.eliminarCita = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM citas WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log('❌ Error MySQL DELETE:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al eliminar la cita' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ message: 'Cita eliminada exitosamente' });
  });
};

// Actualizar una cita
exports.actualizarCita = (req, res) => {
  const { id } = req.params;
  const { servicio, fecha_cita, hora_cita } = req.body;

  const query = 'UPDATE citas SET servicio = ?, fecha_cita = ?, hora_cita = ? WHERE id = ?';
  db.query(query, [servicio, fecha_cita, hora_cita, id], (err, result) => {
    if (err) {
      console.log('❌ Error MySQL PUT:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al actualizar la cita' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ message: 'Cita actualizada exitosamente' });
  });
};