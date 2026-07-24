import { useState, useEffect } from 'react';

function App() {
  const [citas, setCitas] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: '1',
    servicio: '',
    fecha_cita: '',
    hora_cita: ''
  });
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

  // 2. Capturar cambios en los inputs del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Registrar una nueva cita (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await fetch('http://localhost:5000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje('Cita registrada con éxito');
        setFormData({ paciente_id: '1', servicio: '', fecha_cita: '', hora_cita: '' });
        obtenerCitas();
      } else {
        setMensaje(`Error: ${data.error}`);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Agendamiento de Citas Dentales</h1>

      <div style={{ background: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Agendar Nueva Cita</h3>
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

          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Guardar Cita
          </button>
        </form>
      </div>

      <h2>Citas Programadas</h2>
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
                backgroundColor: '#fff'
              }}
            >
              <strong>Servicio:</strong> {cita.servicio} <br />
              <strong>Fecha:</strong> {new Date(cita.fecha_cita).toLocaleDateString()} | <strong>Hora:</strong> {cita.hora_cita} <br />
              <small style={{ color: '#666' }}>Paciente ID: {cita.paciente_id}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;