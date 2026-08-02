import React, { useState } from 'react';

export default function HistorialCitas() {
  // Datos de ejemplo o tus citas reales del estado/API
  const [citas] = useState([
    { id: 1, servicio: 'Limpieza Dental', fecha: '2026-05-10', hora: '10:00', estado: 'Completada', notas_clinicas: 'Evitar alimentos muy calientes o fríos durante las próximas 24 horas. Cepillado suave.' },
    { id: 2, servicio: 'Resina / Empaste', fecha: '2026-06-15', hora: '12:30', estado: 'Completada', notas_clinicas: 'No masticar chicle ni alimentos duros del lado tratado. Próxima revisión en 6 meses.' },
    { id: 3, servicio: 'Ortodoncia (Ajuste)', fecha: '2026-08-20', hora: '16:00', estado: 'Pendiente', notas_clinicas: null }
  ]);

  const fechaActual = new Date().toISOString().split('T')[0];
  const proximasCitas = citas.filter(cita => cita.fecha >= fechaActual);
  const citasPasadas = citas.filter(cita => cita.fecha < fechaActual);

  return (
    <div className="historial-container" style={{ padding: '20px', color: '#333' }}>
      <h2>📅 Mis Citas y Próximas</h2>
      {proximasCitas.length === 0 ? (
        <p>No tienes citas programadas próximamente.</p>
      ) : (
        proximasCitas.map(cita => (
          <div key={cita.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '10px', background: '#fff' }}>
            <p><strong>Servicio:</strong> {cita.servicio}</p>
            <p><strong>Fecha y Hora:</strong> {cita.fecha} a las {cita.hora}</p>
            <p><strong>Estado:</strong> <span style={{ color: 'orange', fontWeight: 'bold' }}>{cita.estado}</span></p>
          </div>
        ))
      )}

      <hr style={{ margin: '30px 0' }} />

      <h2>📋 Historial de Citas y Recomendaciones Médicas</h2>
      {citasPasadas.length === 0 ? (
        <p>No cuentas con historial de consultas pasadas.</p>
      ) : (
        citasPasadas.map(cita => (
          <div key={cita.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px', background: '#f8f9fa' }}>
            <p><strong>Tratamiento realizado:</strong> {cita.servicio}</p>
            <p><strong>Fecha de visita:</strong> {cita.fecha}</p>
            <p><strong>Estado:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{cita.estado}</span></p>

            {cita.notas_clinicas ? (
              <div style={{ background: '#e2f0cb', borderLeft: '4px solid #38b000', padding: '12px', marginTop: '10px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 5px 0', color: '#132a13', fontWeight: 'bold' }}>
                  🩺 Recomendaciones del Odontólogo:
                </p>
                <p style={{ margin: 0, color: '#2d6a4f' }}>{cita.notas_clinicas}</p>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: '#777', fontSize: '0.9rem', marginTop: '8px' }}>
                Sin indicaciones adicionales registradas.
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}