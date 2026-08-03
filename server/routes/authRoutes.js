const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/registro', authController.registro);
router.post('/login', authController.login);

// Rutas protegidas (requieren token JWT)
router.get('/perfil', verificarToken, authController.obtenerPerfil);
router.put('/perfil', verificarToken, authController.actualizarPerfil);

module.exports = router;