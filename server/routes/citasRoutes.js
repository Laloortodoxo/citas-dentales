const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// 1. Ruta exclusiva para Administrador (Obtener todas las citas de la clínica)
router.get('/admin/todas', citasController.obtenerTodasLasCitas);

// 2. Ruta para Paciente (Obtener solo sus citas)
router.get('/paciente/:paciente_id', citasController.obtenerCitasPorPaciente);

// 3. Crear una nueva cita
router.post('/', citasController.crearCita);

// 4. Actualizar una cita
router.put('/:id', citasController.actualizarCita);

// 5. Eliminar una cita
router.delete('/:id', citasController.eliminarCita);

module.exports = router;