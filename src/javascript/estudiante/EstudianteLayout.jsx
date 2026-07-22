import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Encargado.css';
import '../../styles/Estudiante.css';

const EstudianteLayout = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Estudiante');
  const [userRole, setUserRole] = useState('ESTUDIANTE');
  const [initials, setInitials] = useState('ES');
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
      if (!token) {
        navigate('/login');
        return;
      }

      const decoded = parseJwt(token);
      const email = localStorage.getItem('correo') || decoded?.sub || decoded?.username || 'estudiante@utn.edu.ec';
      
      try {
        const response = await api.get(`/usuarios/correo/${email}`);
        const user = response.data;
        const fullName = `${user.usuNombre || ''} ${user.usuApellido || ''}`.trim() || 'Estudiante';
        setUserName(fullName);
        const obtenerIniciales = (nombre, apellido) => {
          return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
        };
        setInitials(obtenerIniciales(user.usuNombre, user.usuApellido) || 'ES');
        setAvatar(user.usuFotoPerfilBase64 || null);
      } catch (err) {
        console.error("Error loading user profile in layout:", err);
      }
    };

    fetchProfile();
  }, [navigate]);

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
              <h2>Smart Waste UTN</h2>
              <span className="brand-subtitle">PANEL ESTUDIANTIL</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/estudiante/mapa" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Mapa
          </NavLink>

          <NavLink 
            to="/estudiante/challenges" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 14zm0 0L5.84 10.578a12.082 12.082 0 00-.665 6.479A11.952 11.952 0 0112 14zm0 0v7.5" />
            </svg>
            Logros y Metas
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link to="/estudiante/perfil" className="user-profile-link">
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
              <p className="user-role">ESTUDIANTE</p>
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

export default EstudianteLayout;
