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
  
  // Estado para la navegación del paciente (pestañas)
  const [vistaPaciente, setVistaPaciente] = useState('citas');

  // Estados específicos para el formulario de actualización de Perfil
  const [perfilData, setPerfilData] = useState({ nombre: '', email: '', password: '' });

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

  // Cargar datos del perfil al iniciar o al cambiar a la pestaña de perfil
  useEffect(() => {
    if (token && usuario) {
      obtenerCitas();
      setPerfilData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        password: ''
      });
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
      const bodyPayload = {
        nombre: authData.nombre,
        email: authData.email,
        correo: authData.email,
        password: authData.password,
        contrasena: authData.password
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
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
            title: `¡Bienvenido, ${data.usuario?.nombre || 'Usuario'}!`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500
          });

          if (data.token) localStorage.setItem('token', data.token);
          if (data.usuario) localStorage.setItem('usuario', JSON.stringify(data.usuario));

          setToken(data.token || 'logged_in');
          setUsuario(data.usuario || { nombre: authData.email, rol: 'paciente' });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Acceso fallido',
          text: data.error || 'Credenciales incorrectas o usuario no encontrado',
          confirmButtonColor: '#0284c7'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor (http://localhost:5000). Revisa que Node.js esté corriendo.',
        confirmButtonColor: '#0284c7'
      });
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

  const handleGuardarNotas = async (cita) => {
    const { value: textoNotas } = await Swal.fire({
      title: '🩺 Notas y Recomendaciones',
      input: 'textarea',
      inputLabel: `Paciente: ${cita.nombre_paciente || `ID: ${cita.paciente_id}`}`,
      inputPlaceholder: 'Escribe aquí el diagnóstico, indicaciones del tratamiento, medicamentos, etc...',
      inputValue: cita.notas_clinicas || '',
      showCancelButton: true,
      confirmButtonText: 'Guardar Notas',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0284c7',
      inputAttributes: { rows: 4 }
    });

    if (textoNotas !== undefined) {
      try {
        const res = await fetch(`http://localhost:5000/api/citas/${cita.id}/notas`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ notas_clinicas: textoNotas })
        });

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Notas clínicas actualizadas',
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
        Swal.fire('Error', 'No se pudo guardar la nota', 'error');
      }
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

  const handlePerfilChange = (e) => {
    setPerfilData({ ...perfilData, [e.target.name]: e.target.value });
  };

  const handlePerfilSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/perfil', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(perfilData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al actualizar el perfil');

      const usuarioActualizado = { ...usuario, nombre: perfilData.nombre, email: perfilData.email };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);

      Swal.fire({
        icon: 'success',
        title: '¡Perfil Actualizado!',
        text: 'Tus datos se han guardado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });

      setPerfilData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
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

  const fechaActualStr = hoyStr;
  const proximasCitas = citas.filter(cita => {
    const fechaCita = cita.fecha_cita ? cita.fecha_cita.split('T')[0] : '';
    return fechaCita >= fechaActualStr;
  });
  const citasPasadas = citas.filter(cita => {
    const fechaCita = cita.fecha_cita ? cita.fecha_cita.split('T')[0] : '';
    return fechaCita < fechaActualStr;
  });

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

                        {cita.notas_clinicas && (
                          <div style={{ background: '#f0f9ff', borderLeft: '3px solid #0284c7', padding: '8px 12px', marginTop: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                            <strong>📝 Indicaciones:</strong> {cita.notas_clinicas}
                          </div>
                        )}
                      </div>

                      <div className="cita-actions">
                        <button onClick={() => handleGuardarNotas(cita)} title="Agregar o editar notas clínicas" className="btn btn-primary btn-icon">📝 Notas</button>
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
                  📅 Mis Citas e Historial
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
                  <h2 className="section-title">📅 Próximas Citas</h2>
                  {proximasCitas.length === 0 ? (
                    <div className="empty-state" style={{ marginBottom: '20px' }}>
                      <p>No tienes citas programadas próximamente.</p>
                    </div>
                  ) : (
                    <ul className="citas-list" style={{ marginBottom: '30px' }}>
                      {proximasCitas.map((cita) => (
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

                  <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                  <h2 className="section-title">📋 Historial de Citas y Recomendaciones</h2>
                  {citasPasadas.length === 0 ? (
                    <div className="empty-state">
                      <p>Aún no cuentas con historial de consultas pasadas.</p>
                    </div>
                  ) : (
                    <ul className="citas-list">
                      {citasPasadas.map((cita) => (
                        <li key={cita.id} className="cita-card" style={{ background: '#f8fafc' }}>
                          <div className="cita-details">
                            <div className="cita-servicio">Tratamiento: {cita.servicio}</div>
                            <div className="cita-meta">
                              📅 Fecha de visita: {new Date(cita.fecha_cita).toLocaleDateString()} | ⏰ {cita.hora_cita}
                            </div>
                            <div>
                              <span className={`status-pill status-${cita.estado}`}>
                                {cita.estado === 'confirmada' ? '🟢 Completada' : cita.estado}
                              </span>
                            </div>

                            {cita.notas_clinicas ? (
                              <div style={{ background: '#e2f0cb', borderLeft: '4px solid #38b000', padding: '12px', marginTop: '12px', borderRadius: '4px' }}>
                                <p style={{ margin: '0 0 5px 0', color: '#132a13', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                  🩺 Recomendaciones del Odontólogo:
                                </p>
                                <p style={{ margin: 0, color: '#2d6a4f', fontSize: '0.9rem' }}>{cita.notas_clinicas}</p>
                              </div>
                            ) : (
                              <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
                                Sin indicaciones clínicas adicionales registradas para esta visita.
                              </p>
                            )}
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

                  <form onSubmit={handlePerfilSubmit}>
                    <div className="form-group">
                      <label>Nombre Completo:</label>
                      <input 
                        type="text" 
                        name="nombre" 
                        value={perfilData.nombre} 
                        onChange={handlePerfilChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico:</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={perfilData.email} 
                        onChange={handlePerfilChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Cuenta:</label>
                      <input 
                        type="text" 
                        value="Paciente Registrado" 
                        disabled 
                        style={{ background: '#f1f5f9', cursor: 'not-allowed' }} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Nueva Contraseña (opcional):</label>
                      <input 
                        type="password" 
                        name="password" 
                        value={perfilData.password} 
                        onChange={handlePerfilChange} 
                        placeholder="Dejar en blanco para conservar la actual" 
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '15px' }}>
                      Actualizar Perfil
                    </button>
                  </form>
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