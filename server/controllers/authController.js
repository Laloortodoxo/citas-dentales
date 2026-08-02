const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // O require('bcryptjs') según la librería instalada en tu package.json

// ------------------------------------------------------------------
// 1. INICIO DE SESIÓN (LOGIN)
// ------------------------------------------------------------------
exports.login = async (req, res) => {
  console.log('\n--------------------------------------------------');
  console.log('📥 Petición recibida en: POST /api/auth/login');
  console.log('📦 Body de la petición:', req.body);

  try {
    const email = req.body.email || req.body.correo;
    const password = req.body.password || req.body.contrasena;

    if (!email || !password) {
      console.warn('⚠️ Petición rechazada: Falta correo o contraseña.');
      return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
    }

    // Buscamos el usuario por la columna 'email'
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    console.log(`🔍 Usuarios encontrados en la BD: ${rows.length}`);

    if (rows.length === 0) {
      console.warn(`⚠️ No se encontró ningún usuario con el correo: ${email}`);
      return res.status(401).json({ error: 'Usuario no encontrado o credenciales incorrectas.' });
    }

    const usuario = rows[0];

    // Detectar la columna de contraseña en la base de datos
    const passwordBD = usuario.password || usuario.contrasena;

    let esPasswordValida = false;

    // Si la contraseña en MySQL empieza por $2a$ o $2b$, está encriptada con Bcrypt
    if (passwordBD && passwordBD.startsWith('$2')) {
      esPasswordValida = await bcrypt.compare(password, passwordBD);
    } else {
      // Comparación directa en texto plano
      esPasswordValida = (passwordBD === password);
    }

    if (!esPasswordValida) {
      console.warn(`⚠️ Contraseña incorrecta para el usuario: ${email}`);
      return res.status(401).json({ error: 'Usuario no encontrado o credenciales incorrectas.' });
    }

    console.log(`✅ ¡Login exitoso! Bienvenido: ${usuario.nombre || usuario.email}`);

    // Generar Token JWT de sesión
    const tokenSecret = process.env.JWT_SECRET || 'secreto_dental_care_2026';
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol || 'paciente' },
      tokenSecret,
      { expiresIn: '8h' }
    );

    return res.json({
      message: 'Inicio de sesión correcto',
      token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol || 'paciente'
      }
    });

  } catch (error) {
    console.error('❌ Error grave en authController (login):', error);
    return res.status(500).json({ error: 'Error interno en el servidor.' });
  }
};

// ------------------------------------------------------------------
// 2. REGISTRO DE NUEVOS USUARIOS
// ------------------------------------------------------------------
exports.registro = async (req, res) => {
  console.log('\n--------------------------------------------------');
  console.log('📥 Petición recibida en: POST /api/auth/registro');
  console.log('📦 Body de la petición:', req.body);

  try {
    const { nombre } = req.body;
    const email = req.body.email || req.body.correo;
    const password = req.body.password || req.body.contrasena;

    if (!nombre || !email || !password) {
      console.warn('⚠️ Datos incompletos para el registro');
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios para crear la cuenta.' 
      });
    }

    // Verificar si el correo ya existe
    const [existentes] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?', 
      [email]
    );

    if (existentes.length > 0) {
      console.warn(`⚠️ El correo ${email} ya existe en la BD.`);
      return res.status(400).json({ 
        error: 'El correo electrónico ya se encuentra registrado.' 
      });
    }

    // Encriptar contraseña antes de guardar en la BD
    const saltRounds = 10;
    const passwordEncriptada = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario con rol paciente por defecto
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordEncriptada, 'paciente']
    );

    console.log(`✅ Nuevo usuario registrado con ID: ${resultado.insertId}`);

    return res.status(201).json({
      message: 'Cuenta creada con éxito',
      usuarioId: resultado.insertId
    });

  } catch (error) {
    console.error('❌ Error grave en authController (registro):', error);
    return res.status(500).json({ 
      error: 'Error interno en el servidor al registrar la cuenta.' 
    });
  }
};