import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const correoUsuario = payload.sub; 

        // Dejamos solo el token, quitamos la cabecera que daba error de CORS
        const config = { 
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        };
        
        // Enviamos el correo como Query Parameter (?correo=...)
        const response = await axios.get(`http://localhost:8080/api/usuarios/me?correo=${correoUsuario}`, config);
        
        setUserData(response.data);
      } catch (err) {
        console.error("Error cargando el perfil:", err);
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userData?.usuId) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      const token = localStorage.getItem('token');
      
      try {
        setLoading(true);
        // Hacemos PATCH enviando el UUID real (usuId) y la foto en Base64
        await axios.patch(`http://localhost:8080/api/usuarios/${userData.usuId}/foto-perfil`, 
          { fotoBase64: base64String },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // Actualiza el estado local para mostrar la imagen inmediatamente
        setUserData(prev => ({ ...prev, usuFotoPerfilBase64: base64String }));
      } catch (err) {
        console.error(err);
        alert("Error al subir la imagen. Verifica el formato o el tamaño del archivo.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="perfil-loading">Cargando información del perfil...</div>;
  if (error || !userData) return <div className="perfil-loading text-danger">{error}</div>;

  const initials = (userData.usuNombre?.charAt(0) || '') + (userData.usuApellido?.charAt(0) || '');
  const rolFormateado = userData.usuRol?.rolNombre || 'USUARIO';

  // Iconos SVG 
  const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-mr"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  );
  const ShieldIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-mr"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  );

  return (
    <div className="perfil-container fade-in">
      
      {/* Sidebar: Foto y Resumen */}
      <div className="perfil-sidebar card-section">
        <div className="sidebar-title">
          Información del {rolFormateado.charAt(0).toUpperCase() + rolFormateado.slice(1).toLowerCase()}
        </div>
        
        <div className="photo-container">
          <label className="upload-label-profile">
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            {userData.usuFotoPerfilBase64 ? (
              <img src={userData.usuFotoPerfilBase64} alt="Perfil" className="profile-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials.toUpperCase()}</div>
            )}
            <div className="edit-overlay">Cambiar Foto</div>
          </label>
        </div>
        
        <div className="sidebar-info">
          <h3 className="profile-name">{userData.usuNombre} {userData.usuApellido}</h3>
          <span className="profile-role-badge">{rolFormateado}</span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="perfil-content">
        
        {/* Ficha del Usuario */}
        <div className="card-section content-card">
          <div className="section-header">
            <h3 className="section-title"><UserIcon /> Ficha del Usuario</h3>
          </div>
          
          <div className="data-grid">
            <div className="data-row">
              <span className="data-label">APELLIDOS Y NOMBRES</span>
              <span className="data-value">{userData.usuApellido} {userData.usuNombre}</span>
            </div>
            <div className="data-row">
              <span className="data-label">IDENTIFICACIÓN</span>
              <span className="data-value">{userData.usuIdentificacion || 'No registrada'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">FACULTAD ASIGNADA</span>
              <span className="data-value">{userData.usuFacultad?.facNombre || 'No asignada'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">FECHA DE REGISTRO</span>
              <span className="data-value">
                {userData.usuCreado ? new Date(userData.usuCreado).toLocaleDateString('es-EC') : 'No registrada'}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">ESTADO DEL PERFIL</span>
              <span className="data-value">
                {userData.usuActivo ? <span className="status-active">Activo</span> : <span className="text-danger">Inactivo</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="card-section content-card mt-3">
          <div className="section-header">
            <h3 className="section-title"><ShieldIcon /> Credenciales y Seguridad</h3>
            <button className="btn-outline-small" onClick={() => navigate('/reset-password')}>
              Cambiar Contraseña
            </button>
          </div>
          
          <div className="data-grid">
            <div className="data-row">
              <span className="data-label">CORREO INSTITUCIONAL</span>
              <span className="data-value text-primary">{userData.usuCorreo}</span>
            </div>
            <div className="data-row">
              <span className="data-label">ROL DE ACCESO</span>
              <span className="data-value">{rolFormateado}</span>
            </div>
            <div className="data-row">
              <span className="data-label">ÚLTIMO ACCESO</span>
              <span className="data-value">
                {userData.usuUltimoLogin ? new Date(userData.usuUltimoLogin).toLocaleString('es-EC') : 'N/A'}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">CONTRASEÑA</span>
              <span className="data-value text-muted">••••••••••••</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Perfil;