const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión o pool a la base de datos MySQL

// ==========================================
// 1. OBTENER TODAS LAS CITAS (Para Admin / Odontólogo)
// GET /api/citas/admin/todas
// ==========================================
router.get('/admin/todas', async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.nombre AS nombre_paciente 
      FROM citas c 
      LEFT JOIN usuarios u ON c.paciente_id = u.id 
      ORDER BY c.fecha_cita DESC, c.hora_cita DESC
    `;
    const [citas] = await db.query(query);
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    res.status(500).json({ error: 'Error al obtener las citas del sistema' });
  }
});

// ==========================================
// 2. OBTENER CITAS DE UN PACIENTE ESPECÍFICO
// GET /api/citas/paciente/:paciente_id
// ==========================================
router.get('/paciente/:paciente_id', async (req, res) => {
  const { paciente_id } = req.params;

  try {
    const query = `
      SELECT * FROM citas 
      WHERE paciente_id = ? 
      ORDER BY fecha_cita DESC, hora_cita DESC
    `;
    const [citas] = await db.query(query, [paciente_id]);
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    res.status(500).json({ error: 'Error al obtener tu historial de citas' });
  }
});

// ==========================================
// 3. AGENDAR NUEVA CITA
// POST /api/citas
// ==========================================
router.post('/', async (req, res) => {
  const { servicio, fecha_cita, hora_cita, paciente_id } = req.body;

  if (!servicio || !fecha_cita || !hora_cita || !paciente_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const query = `
      INSERT INTO citas (servicio, fecha_cita, hora_cita, paciente_id, estado) 
      VALUES (?, ?, ?, ?, 'pendiente')
    `;
    const [resultado] = await db.query(query, [servicio, fecha_cita, hora_cita, paciente_id]);

    res.status(201).json({ 
      message: 'Cita agendada exitosamente', 
      id: resultado.insertId 
    });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ error: 'Error al agendar la cita' });
  }
});

// ==========================================
// 4. EDITAR INFORMACIÓN DE UNA CITA
// PUT /api/citas/:id
// ==========================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { servicio, fecha_cita, hora_cita } = req.body;

  if (!servicio || !fecha_cita || !hora_cita) {
    return res.status(400).json({ error: 'Faltan campos por completar' });
  }

  try {
    const query = `
      UPDATE citas 
      SET servicio = ?, fecha_cita = ?, hora_cita = ? 
      WHERE id = ?
    `;
    const [resultado] = await db.query(query, [servicio, fecha_cita, hora_cita, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});

// ==========================================
// 5. CAMBIAR ESTADO DE LA CITA (Confirmada / Cancelada)
// PATCH /api/citas/:id/estado
// ==========================================
router.patch('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El estado es requerido' });
  }

  try {
    const query = 'UPDATE citas SET estado = ? WHERE id = ?';
    const [resultado] = await db.query(query, [estado, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: `Estado de la cita actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al cambiar el estado:', error);
    res.status(500).json({ error: 'Error al cambiar el estado de la cita' });
  }
});

// ==========================================
// 6. ACTUALIZAR NOTAS Y RECOMENDACIONES CLÍNICAS (CORREGIDO)
// PATCH /api/citas/:id/notas
// ==========================================
router.patch('/:id/notas', async (req, res) => {
  const { id } = req.params;
  
  // Lee 'notas_clinicas' o 'notas' del cuerpo de la petición y evita mandar 'undefined' a MySQL
  const notas = req.body?.notas_clinicas ?? req.body?.notas ?? '';

  console.log('-------------------------------------------');
  console.log(`📌 Procesando actualización de notas para Cita #${id}`);
  console.log('👉 Contenido a guardar:', notas);

  try {
    const query = 'UPDATE citas SET notas_clinicas = ? WHERE id = ?';
    const [resultado] = await db.query(query, [notas, id]);

    if (resultado.affectedRows === 0) {
      console.log(`⚠️ No se encontró la cita con ID #${id}`);
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    console.log(`✅ Notas guardadas exitosamente en MySQL para la Cita #${id}`);
    res.json({ message: 'Notas clínicas actualizadas correctamente' });
  } catch (error) {
    console.error('❌ Error detallado al guardar notas clínicas en MySQL:', error);
    res.status(500).json({ 
      error: 'Error al guardar las notas clínicas en la base de datos', 
      detalle: error.message 
    });
  }
});

// ==========================================
// 7. ELIMINAR CITA
// DELETE /api/citas/:id
// ==========================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM citas WHERE id = ?';
    const [resultado] = await db.query(query, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
});

module.exports = router;