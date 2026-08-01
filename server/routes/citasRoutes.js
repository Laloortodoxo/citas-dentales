const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// Ruta exclusiva para Administrador (Obtener todas las citas de la clínica)
router.get('/admin/todas', citasController.obtenerTodasLasCitas);

// Ruta para cambiar estado de cita (Admin)
router.patch('/:id/estado', citasController.cambiarEstadoCita);

// Rutas Generales / Paciente
router.get('/paciente/:paciente_id', citasController.obtenerCitasPorPaciente);
router.post('/', citasController.crearCita);
router.put('/:id', citasController.actualizarCita);
router.delete('/:id', citasController.eliminarCita);

module.exports = router;