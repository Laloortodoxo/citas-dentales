import { useState, useEffect } from 'react';

function App() {
  // Estado de Autenticación
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [modoAuth, setModoAuth] = useState('login'); // 'login' o 'registro'
  const [authData, setAuthData] = useState({ nombre: '', email: '', password: '' });

  // Estado de Citas
  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState({ servicio: '', fecha_cita: '', hora_cita: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // 1. Cargar Citas al estar autenticado
  const obtenerCitas = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/citas');
      const data = await res.json();
      setCitas(data);
    } catch (error) {
      console.error('Error al obtener citas:', error);
    }
  };

  useEffect(() => {
    if (token) {
      obtenerCitas();
    }
  }, [token]);

  // 2. Manejo de inputs del Login / Registro
  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  // 3. Submit de Login o Registro
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const url = modoAuth === 'login' 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/registro';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });

      const data = await res.json();

      if (res.ok) {
        if (modoAuth === 'registro') {
          setMensaje('✅ Registro exitoso. ¡Ahora puedes iniciar sesión!');
          setModoAuth('login');
          setAuthData({ nombre: '', email: '', password: '' });
        } else {
          // Guardar sesión
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          setToken(data.token);
          setUsuario(data.usuario);
          setMensaje('');
        }
      } else {
        setMensaje(`❌ ${data.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión con el servidor');
    }
  };

  // 4. Cerrar Sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken('');
    setUsuario(null);
    setCitas([]);
  };

  // 5. Manejo del formulario de Citas
  const handleCitaChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitaSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const url = editandoId
      ? `http://localhost:5000/api/citas/${editandoId}`
      : 'http://localhost:5000/api/citas';

    const method = editandoId ? 'PUT' : 'POST';
    const bodyCita = { ...formData, paciente_id: usuario.id };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyCita)
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(editandoId ? '✅ Cita actualizada con éxito' : '✅ Cita registrada con éxito');
        setFormData({ servicio: '', fecha_cita: '', hora_cita: '' });
        setEditandoId(null);
        obtenerCitas();
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
    }
  };

  const handleEditar = (cita) => {
    setEditandoId(cita.id);
    setFormData({
      servicio: cita.servicio,
      fecha_cita: cita.fecha_cita ? cita.fecha_cita.split('T')[0] : '',
      hora_cita: cita.hora_cita
    });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta cita?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/citas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMensaje('🗑️ Cita eliminada');
        obtenerCitas();
      }
    } catch (error) {
      setMensaje('❌ Error de conexión al eliminar');
    }
  };

  // --- VISTA DE LOGIN Y REGISTRO ---
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>🦷 DentalCare - Autenticación</h2>
        <h3>{modoAuth === 'login' ? '🔑 Iniciar Sesión' : '📝 Crear Cuenta'}</h3>
        
        {mensaje && <p style={{ fontWeight: 'bold' }}>{mensaje}</p>}

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {modoAuth === 'registro' && (
            <div>
              <label>Nombre Completo:</label>
              <input
                type="text"
                name="nombre"
                value={authData.nombre}
                onChange={handleAuthChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          )}

          <div>
            <label>Correo Electrónico:</label>
            <input
              type="email"
              name="email"
              value={authData.email}
              onChange={handleAuthChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={authData.password}
              onChange={handleAuthChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
          >
            {modoAuth === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          {modoAuth === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            onClick={() => { setModoAuth(modoAuth === 'login' ? 'registro' : 'login'); setMensaje(''); }}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {modoAuth === 'login' ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    );
  }

  // --- VISTA PRINCIPAL (PANEL DE CITAS) ---
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👋 Hola, {usuario?.nombre}</h2>
        <button
          onClick={handleCerrarSesion}
          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{ background: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{editandoId ? '✏️ Editar Cita' : '📅 Agendar Nueva Cita'}</h3>
        {mensaje && <p style={{ fontWeight: 'bold' }}>{mensaje}</p>}

        <form onSubmit={handleCitaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>Servicio Dental: </label>
            <input
              type="text"
              name="servicio"
              placeholder="Ej. Limpieza, Ortodoncia"
              value={formData.servicio}
              onChange={handleCitaChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div>
            <label>Fecha: </label>
            <input
              type="date"
              name="fecha_cita"
              value={formData.fecha_cita}
              onChange={handleCitaChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div>
            <label>Hora: </label>
            <input
              type="time"
              name="hora_cita"
              value={formData.hora_cita}
              onChange={handleCitaChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: '10px', backgroundColor: editandoId ? '#28a745' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
          >
            {editandoId ? 'Guardar Cambios' : 'Guardar Cita'}
          </button>
        </form>
      </div>

      <h2>📅 Citas Programadas</h2>
      {citas.length === 0 ? (
        <p>No hay citas agendadas aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {citas.map((cita) => (
            <li key={cita.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Servicio:</strong> {cita.servicio} <br />
                <strong>Fecha:</strong> {new Date(cita.fecha_cita).toLocaleDateString()} | <strong>Hora:</strong> {cita.hora_cita} <br />
                <small style={{ color: '#666' }}>Paciente ID: {cita.paciente_id}</small>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEditar(cita)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleEliminar(cita.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;