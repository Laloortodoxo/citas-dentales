// Crear una nueva cita con validación de fecha
exports.crearCita = (req, res) => {
  const { paciente_id, servicio, fecha_cita, hora_cita } = req.body;

  if (!paciente_id || !servicio || !fecha_cita || !hora_cita) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validación de fecha pasadas
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