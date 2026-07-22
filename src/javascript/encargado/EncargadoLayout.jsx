import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api'; 
import '../../styles/Encargado.css';

const EncargadoLayout = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuario Encargado');
  const [userRole, setUserRole] = useState('ENCARGADO');
  const [initials, setInitials] = useState('EN');
  const [avatar, setAvatar] = useState(null); 

  useEffect(() => {
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = parseJwt(token);
      const email = localStorage.getItem('correo') || decoded?.sub || decoded?.username;
      
      setUserRole(localStorage.getItem('rol') || 'ENCARGADO');

      if (email) {
        try {
          const response = await api.get(`/usuarios/correo/${email}`);
          const user = response.data;
          
          const fullName = `${user.usuNombre || ''} ${user.usuApellido || ''}`.trim() || 'Usuario Encargado';
          setUserName(fullName);
          
          const obtenerIniciales = (nombre, apellido) => {
            return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
          };
          setInitials(obtenerIniciales(user.usuNombre, user.usuApellido) || 'EN');
          
          setAvatar(user.usuFotoPerfilBase64 || null);
        } catch (err) {
          console.error("Error al cargar perfil:", err);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="encargado-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-container">
            <svg className="brand-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <div className="brand-text">
              <h2>Residuos inteligentes de UTN</h2>
              <span className="brand-subtitle">CAMPUS EL OLIVO</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/encargado/mapa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Mapa
          </NavLink>
          <NavLink to="/encargado/recoleccion" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Recolección
          </NavLink>
          <NavLink to="/encargado/llenado" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            Llenado
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link to="/encargado/perfil" className="user-profile-link">
            {avatar ? (
              <img
                src={avatar.startsWith('data:') ? avatar : `data:image/png;base64,${avatar}`}
                alt="Avatar"
                className="profile-img"
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="avatar-circle" translate="no">
                <span className="avatar-initials" translate="no">{initials}</span>
                <span className="online-dot"></span>
              </div>
            )}
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className="user-role">{userRole}</p>
            </div>
          </Link>

          <button className="btn-logout-full" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="encargado-content">
        <Outlet />
      </main>
    </div>
  );
};

export default EncargadoLayout;