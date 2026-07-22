import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api'; 
import '../../styles/Encargado.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Administrador UTN');
  const [userRole, setUserRole] = useState('ADMINISTRADOR');
  const [initials, setInitials] = useState('AD');
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
      
      setUserRole(localStorage.getItem('rol') || 'ADMINISTRADOR');

      if (email) {
        try {
          const response = await api.get(`/usuarios/correo/${email}`);
          const user = response.data;
          
          const fullName = `${user.usuNombre || ''} ${user.usuApellido || ''}`.trim() || 'Administrador UTN';
          setUserName(fullName);
          
          const obtenerIniciales = (nombre, apellido) => {
            return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
          };
          setInitials(obtenerIniciales(user.usuNombre, user.usuApellido) || 'AD');
          
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <div className="brand-text">
              <h2>Panel de Control</h2>
              <span className="brand-subtitle">SMART WASTE UTN</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/mapa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Mapa del Campus
          </NavLink>

          <NavLink to="/admin/colecciones" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Colecciones
          </NavLink>

          <NavLink to="/admin/metricas" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Métricas
          </NavLink>

          <NavLink to="/admin/logros" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            Logros
          </NavLink>

          <NavLink to="/admin/reportes-incidencias" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Reportes de Incidencias
          </NavLink>

          <NavLink to="/admin/contenedores" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Contenedores
          </NavLink>

          <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Gestión Usuarios
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/perfil" className="user-profile-link">
            {avatar ? (
              <img
                src={avatar.startsWith('data:') ? avatar : `data:image/png;base64,${avatar}`}
                alt="Avatar"
                className="profile-img"
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="avatar-circle" style={{ backgroundColor: '#bbf7d0', color: '#166534' }}>
                <span className="avatar-initials">{initials}</span>
                <span className="online-dot"></span>
              </div>
            )}
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className="user-role">{userRole}</p>
            </div>
          </Link>
        </div>

        <button className="btn-logout-full" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar Sesión
        </button>
      </aside>

      <main className="encargado-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;