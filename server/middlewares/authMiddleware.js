const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  // El formato suele ser "Bearer <token>"
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Token inválido o malformado.' });
  }

  try {
    const tokenSecret = process.env.JWT_SECRET || 'secreto_dental_care_2026';
    const decoded = jwt.verify(token, tokenSecret);
    
    // Guardamos los datos decodificados del usuario en la petición
    req.usuario = decoded; 
    next();
  } catch (error) {
    console.error('❌ Error al verificar token:', error.message);
    return res.status(403).json({ error: 'El token ha expirado o es inválido.' });
  }
};

module.exports = verificarToken;