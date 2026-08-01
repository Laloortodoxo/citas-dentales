const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

// Rutas protegidas solo para Administrador / Odontólogo
router.get('/admin/todas', verificarToken, verificarAdmin, citasController.obtenerTodasLasCitas);
router.patch('/:id/estado', verificarToken, verificarAdmin, citasController.cambiarEstadoCita);

// Rutas protegidas para Pacientes y Operaciones CRUD
router.get('/paciente/:paciente_id', verificarToken, citasController.obtenerCitasPorPaciente);
router.post('/', verificarToken, citasController.crearCita);
router.put('/:id', verificarToken, citasController.actualizarCita);
router.delete('/:id', verificarToken, citasController.eliminarCita);

module.exports = router;