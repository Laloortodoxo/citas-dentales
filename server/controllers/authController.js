const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Registro de usuario con validaciones
exports.registrarUsuario = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validación: Formato de Correo Electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Por favor, ingresa un correo electrónico válido' });
  }

  // Validación: Longitud mínima de contraseña
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    const query = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
    db.query(query, [nombre, email, passwordHashed], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
        return res.status(500).json({ error: 'Error al registrar el usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado con éxito', usuario_id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 2. Login de usuario con soporte de ROL
exports.loginUsuario = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const usuario = results[0];

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Incluimos el ROL en la firma del token JWT
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_jwt_temporal',
      { expiresIn: '2h' }
    );

    // Devolvemos los datos del usuario junto con su ROL al cliente
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        rol: usuario.rol || 'paciente' 
      }
    });
  });
};