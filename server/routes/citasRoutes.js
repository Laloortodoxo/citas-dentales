const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// Obtener solo las citas de un paciente específico
router.get('/paciente/:paciente_id', citasController.obtenerCitasPorPaciente);

router.post('/', citasController.crearCita);
router.put('/:id', citasController.actualizarCita);
router.delete('/:id', citasController.eliminarCita);

module.exports = router;