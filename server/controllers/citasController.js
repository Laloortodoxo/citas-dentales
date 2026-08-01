const db = require('../config/db');

// 1. Obtener citas solo del paciente autenticado
exports.obtenerCitasPorPaciente = (req, res) => {
  const { paciente_id } = req.params;

  const query = 'SELECT * FROM citas WHERE paciente_id = ?';
  db.query(query, [paciente_id], (err, results) => {
    if (err) {
      console.log('❌ Error MySQL GET por paciente:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al obtener las citas' });
    }
    res.json(results);
  });
};

// 2. Obtener TODAS las citas con nombre del paciente (Exclusivo Admin / Odontólogo)
exports.obtenerTodasLasCitas = (req, res) => {
  const query = `
    SELECT citas.id, citas.servicio, citas.fecha_cita, citas.hora_cita, citas.paciente_id, usuarios.nombre AS nombre_paciente 
    FROM citas 
    JOIN usuarios ON citas.paciente_id = usuarios.id 
    ORDER BY citas.fecha_cita ASC, citas.hora_cita ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log('❌ Error MySQL GET todas las citas:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al obtener la agenda general' });
    }
    res.json(results);
  });
};

// 3. Crear una nueva cita con validación de fecha pasada
exports.crearCita = (req, res) => {
  const { paciente_id, servicio, fecha_cita, hora_cita } = req.body;

  if (!paciente_id || !servicio || !fecha_cita || !hora_cita) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validación de fecha pasada
  const fechaSeleccionada = new Date(fecha_cita + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaSeleccionada < hoy) {
    return res.status(400).json({ error: 'No puedes agendar una cita en una fecha pasada' });
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

// 4. Actualizar una cita existente
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

// 5. Eliminar una cita
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