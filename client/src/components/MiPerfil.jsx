import { useState } from 'react';
import Swal from 'sweetalert2';

function MiPerfil({ usuario, setUsuario, token }) {
  const [perfilData, setPerfilData] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    password: ''
  });

  const handlePerfilChange = (e) => {
    setPerfilData({ ...perfilData, [e.target.name]: e.target.value });
  };

  const handlePerfilSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(perfilData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al actualizar el perfil');

      const usuarioActualizado = {
        ...usuario,
        nombre: perfilData.nombre,
        email: perfilData.email
      };
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

  return (
    <div className="profile-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div className="profile-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', fontWeight: 'bold', fontSize: '24px' }}>
          {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 style={{ margin: 0 }}>{usuario?.nombre}</h3>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>{usuario?.email}</p>
        </div>
      </div>

      <form onSubmit={handlePerfilSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nombre Completo:</label>
          <input 
            type="text" 
            name="nombre" 
            value={perfilData.nombre} 
            onChange={handlePerfilChange} 
            required 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Correo Electrónico:</label>
          <input 
            type="email" 
            name="email" 
            value={perfilData.email} 
            onChange={handlePerfilChange} 
            required 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tipo de Cuenta:</label>
          <input 
            type="text" 
            value={usuario?.rol ? (usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)) : 'Paciente Registrado'} 
            disabled 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nueva Contraseña (opcional):</label>
          <input 
            type="password" 
            name="password" 
            value={perfilData.password} 
            onChange={handlePerfilChange} 
            placeholder="Dejar en blanco para conservar la actual" 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Actualizar Perfil
        </button>
      </form>
    </div>
  );
}

export default MiPerfil;