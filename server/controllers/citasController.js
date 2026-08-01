const db = require('../db');

// Obtener citas de un paciente específico
exports.obtenerCitasPorPaciente = (req, res) => {
  const { paciente_id } = req.params;
  const sql = 'SELECT * FROM citas WHERE paciente_id = ? ORDER BY fecha_cita ASC, hora_cita ASC';
  
  db.query(sql, [paciente_id], (err, results) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al consultar las citas' });
    }
    res.json(results);
  });
};

// Obtener todas las citas con el nombre del paciente (Modo Admin)
exports.obtenerTodasLasCitas = (req, res) => {
  const sql = `
    SELECT citas.*, usuarios.nombre AS nombre_paciente, usuarios.email AS email_paciente 
    FROM citas 
    JOIN usuarios ON citas.paciente_id = usuarios.id 
    ORDER BY fecha_cita ASC, hora_cita ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener todas las citas:', err);
      return res.status(500).json({ error: 'Error al obtener la agenda global' });
    }
    res.json(results);
  });
};

// Registrar nueva cita
exports.crearCita = (req, res) => {
  const { paciente_id, servicio, fecha_cita, hora_cita } = req.body;

  if (!paciente_id || !servicio || !fecha_cita || !hora_cita) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO citas (paciente_id, servicio, fecha_cita, hora_cita, estado) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [paciente_id, servicio, fecha_cita, hora_cita, 'pendiente'], (err, result) => {
    if (err) {
      console.error('Error al crear cita:', err);
      return res.status(500).json({ error: 'Error al registrar la cita' });
    }
    res.status(201).json({ message: 'Cita registrada con éxito', id: result.insertId });
  });
};

// Editar cita
exports.actualizarCita = (req, res) => {
  const { id } = req.params;
  const { servicio, fecha_cita, hora_cita } = req.body;

  const sql = 'UPDATE citas SET servicio = ?, fecha_cita = ?, hora_cita = ? WHERE id = ?';
  db.query(sql, [servicio, fecha_cita, hora_cita, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar cita:', err);
      return res.status(500).json({ error: 'Error al actualizar la cita' });
    }
    res.json({ message: 'Cita actualizada con éxito' });
  });
};

// Cambiar estado de cita (Confirmar / Cancelar)
exports.cambiarEstadoCita = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['confirmada', 'cancelada', 'pendiente'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  const sql = 'UPDATE citas SET estado = ? WHERE id = ?';
  db.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ error: 'Error al cambiar el estado' });
    }
    res.json({ message: `Cita marcada como ${estado}` });
  });
};

// Eliminar cita
exports.eliminarCita = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM citas WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar cita:', err);
      return res.status(500).json({ error: 'Error al eliminar la cita' });
    }
    res.json({ message: 'Cita eliminada con éxito' });
  });
};