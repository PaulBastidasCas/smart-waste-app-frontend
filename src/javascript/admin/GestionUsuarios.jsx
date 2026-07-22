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
    if(window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${usuId}`);
        setUsuarios(usuarios.filter(u => u.usuId !== usuId));
      } catch (error) { console.error("Error al eliminar:", error); }
    }
  };

  if (loading) return <div className="encargado-content">Cargando usuarios...</div>;

  return (
    <div className="encargado-content">
      <h2>Gestión de Usuarios</h2>
      <div className="col-card">
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{textAlign: 'left', borderBottom: '1px solid #e2e8f0'}}>
              <th style={{padding: '10px'}}>Nombre</th>
              <th style={{padding: '10px'}}>Correo</th>
              <th style={{padding: '10px'}}>Rol</th>
              <th style={{padding: '10px'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usu => (
              <tr key={usu.usuId} style={{borderBottom: '1px solid #f1f5f9'}}>
                <td style={{padding: '10px'}}>{usu.usuNombre}</td>
                <td style={{padding: '10px'}}>{usu.usuCorreo}</td>
                <td style={{padding: '10px'}}>
                  <select 
                    value={usu.usuRol ? usu.usuRol.rolNombre : ""} 
                    onChange={(e) => cambiarRol(usu.usuId, e.target.value)}
                  >
                    <option value="ESTUDIANTE">Estudiante</option>
                    <option value="ENCARGADO">Encargado</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </td>
                <td style={{padding: '10px'}}>
                  <button 
                    onClick={() => eliminarUsuario(usu.usuId)} 
                    style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}
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
  );
};

export default GestionUsuarios;