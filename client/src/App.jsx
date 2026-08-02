import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [modoAuth, setModoAuth] = useState('login');
  const [authData, setAuthData] = useState({ nombre: '', email: '', password: '' });

  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState({ servicio: '', fecha_cita: '', hora_cita: '' });
  const [editandoId, setEditandoId] = useState(null);
  
  // Nuevo estado para la navegación del paciente (pestañas)
  const [vistaPaciente, setVistaPaciente] = useState('citas');

  const hoyStr = new Date().toISOString().split('T')[0];

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const obtenerCitas = async () => {
    if (!usuario || !token) return;
    const esAdmin = usuario.rol === 'admin';
    const url = esAdmin 
      ? 'http://localhost:5000/api/citas/admin/todas' 
      : `http://localhost:5000/api/citas/paciente/${usuario.id}`;

    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setCitas(data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: data.error,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error) {
      console.error('Error al obtener citas:', error);
    }
  };

  useEffect(() => {
    if (token && usuario) {
      obtenerCitas();
    }
  }, [token, usuario]);

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
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
          Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
            confirmButtonColor: '#0284c7'
          });
          setModoAuth('login');
          setAuthData({ nombre: '', email: '', password: '' });
        } else {
          Swal.fire({
            icon: 'success',
            title: `¡Bienvenido, ${data.usuario.nombre}!`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500
          });
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          setToken(data.token);
          setUsuario(data.usuario);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Acceso fallido',
          text: data.error,
          confirmButtonColor: '#0284c7'
        });
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  };

  const handleCerrarSesion = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que ingresar tus credenciales nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken('');
        setUsuario(null);
        setCitas([]);
      }
    });
  };

  const handleCitaChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitaSubmit = async (e) => {
    e.preventDefault();
    const url = editandoId
      ? `http://localhost:5000/api/citas/${editandoId}`
      : 'http://localhost:5000/api/citas';
    const method = editandoId ? 'PUT' : 'POST';
    const bodyCita = { ...formData, paciente_id: usuario.id };

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyCita)
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: editandoId ? 'Cita Actualizada' : 'Cita Agendada',
          text: data.message || 'Operación realizada correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        setFormData({ servicio: '', fecha_cita: '', hora_cita: '' });
        setEditandoId(null);
        obtenerCitas();
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de conexión', 'error');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:5000/api/citas/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: `Cita marcada como ${nuevoEstado}`,
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000
        });
        obtenerCitas();
      } else {
        const data = await res.json();
        Swal.fire('Error', data.error, 'error');
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
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

  const handleEliminar = (id) => {
    Swal.fire({
      title: '¿Eliminar cita?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:5000/api/citas/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          if (res.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminada!',
              text: 'La cita fue eliminada del sistema.',
              timer: 1800,
              showConfirmButton: false
            });
            obtenerCitas();
          } else {
            const data = await res.json();
            Swal.fire('Error', data.error, 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Error de conexión al eliminar', 'error');
        }
      }
    });
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🦷 DentalCare</h2>
            <h3>{modoAuth === 'login' ? '🔑 Iniciar Sesión' : '📝 Crear Cuenta'}</h3>
          </div>
          
          <form onSubmit={handleAuthSubmit}>
            {modoAuth === 'registro' && (
              <div className="form-group">
                <label>Nombre Completo:</label>
                <input type="text" name="nombre" value={authData.nombre} onChange={handleAuthChange} required placeholder="Ej. Elena Ramos" />
              </div>
            )}
            <div className="form-group">
              <label>Correo Electrónico:</label>
              <input type="email" name="email" value={authData.email} onChange={handleAuthChange} required placeholder="correo@ejemplo.com" />
            </div>
            <div className="form-group">
              <label>Contraseña:</label>
              <input type="password" name="password" value={authData.password} onChange={handleAuthChange} required minLength={6} placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {modoAuth === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            {modoAuth === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button onClick={() => setModoAuth(modoAuth === 'login' ? 'registro' : 'login')} className="btn-link">
              {modoAuth === 'login' ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const esAdmin = usuario?.rol === 'admin';

  return (
    <div className="dashboard-container">
      <nav className="user-navbar">
        <div className="user-info">
          <h2>👋 Hola, {usuario?.nombre}</h2>
          <span className={`role-badge ${esAdmin ? 'role-admin' : 'role-paciente'}`}>
            {esAdmin ? '👨‍⚕️ Odontólogo / Admin' : '👤 Paciente'}
          </span>
        </div>
        <button onClick={handleCerrarSesion} className="btn btn-danger">
          Cerrar Sesión
        </button>
      </nav>

      <div className="dashboard-grid">
        <aside className="form-card">
          <h3>{editandoId ? '✏️ Editar Cita' : '📅 Agendar Nueva Cita'}</h3>
          
          <form onSubmit={handleCitaSubmit}>
            <div className="form-group">
              <label>Servicio Dental:</label>
              <input type="text" name="servicio" placeholder="Ej. Limpieza, Ortodoncia" value={formData.servicio} onChange={handleCitaChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha:</label>
                <input type="date" name="fecha_cita" min={hoyStr} value={formData.fecha_cita} onChange={handleCitaChange} required />
              </div>
              <div className="form-group">
                <label>Hora:</label>
                <input type="time" name="hora_cita" value={formData.hora_cita} onChange={handleCitaChange} required />
              </div>
            </div>

            <button type="submit" className={`btn ${editandoId ? 'btn-success' : 'btn-primary'} btn-block`}>
              {editandoId ? 'Guardar Cambios' : 'Guardar Cita'}
            </button>
            {editandoId && (
              <button type="button" onClick={() => { setEditandoId(null); setFormData({ servicio: '', fecha_cita: '', hora_cita: '' }); }} className="btn btn-secondary btn-block" style={{ marginTop: '8px' }}>
                Cancelar Edición
              </button>
            )}
          </form>
        </aside>

        <main className="citas-section">
          {esAdmin ? (
            <>
              <h2 className="section-title">📋 Agenda General de la Clínica</h2>
              {citas.length === 0 ? (
                <div className="empty-state">
                  <p>No hay citas agendadas en el sistema.</p>
                </div>
              ) : (
                <ul className="citas-list">
                  {citas.map((cita) => (
                    <li key={cita.id} className="cita-card">
                      <div className="cita-details">
                        <div className="cita-servicio">{cita.servicio}</div>
                        <div className="cita-meta">
                          📅 {new Date(cita.fecha_cita).toLocaleDateString()} | ⏰ {cita.hora_cita}
                        </div>
                        <div>
                          <span className={`status-pill status-${cita.estado}`}>
                            {cita.estado === 'confirmada' ? '🟢 Confirmada' : cita.estado === 'cancelada' ? '🔴 Cancelada' : '🟡 Pendiente'}
                          </span>
                        </div>
                        <div className="paciente-tag">
                          👤 Paciente: {cita.nombre_paciente || `ID: ${cita.paciente_id}`}
                        </div>
                      </div>

                      <div className="cita-actions">
                        <button onClick={() => handleCambiarEstado(cita.id, 'confirmada')} title="Confirmar Cita" className="btn btn-success btn-icon">✓</button>
                        <button onClick={() => handleCambiarEstado(cita.id, 'cancelada')} title="Cancelar Cita" className="btn btn-danger btn-icon">✕</button>
                        <button onClick={() => handleEditar(cita)} className="btn btn-warning btn-icon">Editar</button>
                        <button onClick={() => handleEliminar(cita.id)} className="btn btn-secondary btn-icon">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div className="client-tabs">
                <button 
                  className={`tab-btn ${vistaPaciente === 'citas' ? 'active' : ''}`}
                  onClick={() => setVistaPaciente('citas')}
                >
                  📅 Mis Citas
                </button>
                <button 
                  className={`tab-btn ${vistaPaciente === 'perfil' ? 'active' : ''}`}
                  onClick={() => setVistaPaciente('perfil')}
                >
                  👤 Mi Perfil
                </button>
              </div>

              {vistaPaciente === 'citas' && (
                <>
                  <h2 className="section-title">📅 Mis Citas Programadas</h2>
                  {citas.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes citas agendadas por el momento.</p>
                    </div>
                  ) : (
                    <ul className="citas-list">
                      {citas.map((cita) => (
                        <li key={cita.id} className="cita-card">
                          <div className="cita-details">
                            <div className="cita-servicio">{cita.servicio}</div>
                            <div className="cita-meta">
                              📅 {new Date(cita.fecha_cita).toLocaleDateString()} | ⏰ {cita.hora_cita}
                            </div>
                            <div>
                              <span className={`status-pill status-${cita.estado}`}>
                                {cita.estado === 'confirmada' ? '🟢 Confirmada' : cita.estado === 'cancelada' ? '🔴 Cancelada' : '🟡 Pendiente'}
                              </span>
                            </div>
                          </div>
                          <div className="cita-actions">
                            <button onClick={() => handleEditar(cita)} className="btn btn-warning btn-icon">Editar</button>
                            <button onClick={() => handleEliminar(cita.id)} className="btn btn-secondary btn-icon">Eliminar</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {vistaPaciente === 'perfil' && (
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3>{usuario?.nombre}</h3>
                      <p style={{ color: 'var(--text-muted)' }}>{usuario?.email}</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nombre Completo:</label>
                    <input type="text" value={usuario?.nombre || ''} disabled style={{ backgroundColor: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico:</label>
                    <input type="email" value={usuario?.email || ''} disabled style={{ backgroundColor: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Cuenta:</label>
                    <input type="text" value="Paciente Registrado" disabled style={{ backgroundColor: '#f1f5f9' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;