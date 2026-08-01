import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import '../../styles/Encargado.css';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get('/usuarios');
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const cambiarRol = async (usuId, nuevoRol) => {
    try {
      await api.put(`/usuarios/${usuId}/rol`, { rol: nuevoRol });
      alert("Rol actualizado correctamente");
      window.location.reload();
    } catch (error) { console.error("Error actualizando rol:", error); }
  };

  const eliminarUsuario = async (usuId) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${usuId}`);
        setUsuarios(usuarios.filter(u => u.usuId !== usuId));
      } catch (error) { console.error("Error al eliminar:", error); }
    }
  };

  if (loading) return <div className="encargado-content">Cargando usuarios...</div>;

  return (
    <div className="encargado-content">
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Gestión de Usuarios</h2>
      <div className="col-card" style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', color: '#475569' }}>Nombre</th>
                <th style={{ padding: '12px', color: '#475569' }}>Correo</th>
                <th style={{ padding: '12px', color: '#475569' }}>Rol</th>
                <th style={{ padding: '12px', color: '#475569' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usu => (
                <tr key={usu.usuId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{usu.usuNombre}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{usu.usuCorreo}</td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={usu.usuRol ? usu.usuRol.rolNombre : ""}
                      onChange={(e) => cambiarRol(usu.usuId, e.target.value)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="ENCARGADO">Encargado</option>
                      <option value="ADMINISTRADOR">Administrador</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => eliminarUsuario(usu.usuId)}
                      style={{ color: '#ef4444', border: 'none', background: '#fef2f2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default GestionUsuarios;