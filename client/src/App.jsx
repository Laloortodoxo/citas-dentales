import { useState, useEffect } from 'react';

function App() {
  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: '1',
    servicio: '',
    fecha_cita: '',
    hora_cita: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // 1. Obtener la lista de citas desde la API
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
    obtenerCitas();
  }, []);

  // 2. Capturar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Crear o Actualizar Cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const url = editandoId
      ? `http://localhost:5000/api/citas/${editandoId}`
      : 'http://localhost:5000/api/citas';
    
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(editandoId ? '✅ Cita actualizada con éxito' : '✅ Cita registrada con éxito');
        setFormData({ paciente_id: '1', servicio: '', fecha_cita: '', hora_cita: '' });
        setEditandoId(null);
        obtenerCitas();
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión con el servidor');
    }
  };

  // 4. Iniciar edición de cita
  const handleEditar = (cita) => {
    setEditandoId(cita.id);
    setFormData({
      paciente_id: cita.paciente_id,
      servicio: cita.servicio,
      fecha_cita: cita.fecha_cita ? cita.fecha_cita.split('T')[0] : '',
      hora_cita: cita.hora_cita
    });
  };

  // 5. Cancelar modo edición
  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormData({ paciente_id: '1', servicio: '', fecha_cita: '', hora_cita: '' });
  };

  // 6. Eliminar Cita
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar/eliminar esta cita?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/citas/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMensaje('🗑️ Cita eliminada correctamente');
        obtenerCitas();
      } else {
        const data = await res.json();
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión al eliminar');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>🦷 Agendamiento de Citas Dentales</h1>

      <div style={{ background: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>{editandoId ? '✏️ Editar Cita' : '📅 Agendar Nueva Cita'}</h3>
        {mensaje && <p style={{ fontWeight: 'bold' }}>{mensaje}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>ID Paciente: </label>
            <input
              type="number"
              name="paciente_id"
              value={formData.paciente_id}
              onChange={handleChange}
              required
              disabled={!!editandoId}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div>
            <label>Servicio Dental: </label>
            <input
              type="text"
              name="servicio"
              placeholder="Ej. Limpieza, Ortodoncia, Extracción"
              value={formData.servicio}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: editandoId ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {editandoId ? 'Guardar Cambios' : 'Guardar Cita'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={handleCancelarEdicion}
                style={{
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>📅 Citas Programadas</h2>
      {citas.length === 0 ? (
        <p>No hay citas agendadas aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {citas.map((cita) => (
            <li
              key={cita.id}
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '10px',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>Servicio:</strong> {cita.servicio} <br />
                <strong>Fecha:</strong> {new Date(cita.fecha_cita).toLocaleDateString()} | <strong>Hora:</strong> {cita.hora_cita} <br />
                <small style={{ color: '#666' }}>Paciente ID: {cita.paciente_id}</small>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleEditar(cita)}
                  style={{
                    backgroundColor: '#ffc107',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(cita.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;