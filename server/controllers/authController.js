const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuarios
exports.registro = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const rolUsuario = rol || 'paciente';

    const sql = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, email, hashedPassword, rolUsuario], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
        return res.status(500).json({ error: 'Error al registrar el usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor al cifrar la contraseña' });
  }
};

// Login de usuarios con generación de JWT
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = results[0];
    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  });
};