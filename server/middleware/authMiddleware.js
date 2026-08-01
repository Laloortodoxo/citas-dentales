const jwt = require('jsonwebtoken');

// 1. Verificar token de autenticación
exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Formato recibido: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
    req.usuario = decoded; // Adjunta id, email y rol a la petición
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// 2. Verificar permisos de Administrador / Odontólogo
exports.verificarAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Administrador' });
  }
};