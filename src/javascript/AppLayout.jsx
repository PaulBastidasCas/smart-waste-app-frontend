import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 
import '../styles/Encargado.css';
import logoUtn from '../assets/logo-utn.png';

const AppLayout = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuario UTN');
  const [userRole, setUserRole] = useState(localStorage.getItem('rol') || 'ESTUDIANTE');
  const [initials, setInitials] = useState('UT');
  const [avatar, setAvatar] = useState(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')));
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
      const email = localStorage.getItem('correo') || decoded?.sub || decoded?.username;
      setUserRole(localStorage.getItem('rol') || 'ESTUDIANTE');

      if (email) {
        try {
          const response = await api.get(`/usuarios/correo/${email}`);
          const user = response.data;
          const fullName = `${user.usuNombre || ''} ${user.usuApellido || ''}`.trim() || 'Usuario UTN';
          setUserName(fullName);
          setInitials(`${user.usuNombre?.charAt(0) || ''}${user.usuApellido?.charAt(0) || ''}`.toUpperCase() || 'UT');
          setAvatar(user.usuFotoPerfilBase64 || null);
        } catch (err) {
          console.error("Error al cargar perfil:", err);
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const getBrandText = () => {
    if (userRole === 'ADMINISTRADOR') return { title: 'Panel de Control', subtitle: 'SMART WASTE UTN' };
    if (userRole === 'ENCARGADO') return { title: 'Residuos Inteligentes', subtitle: 'CAMPUS EL OLIVO' };
    return { title: 'Smart Waste UTN', subtitle: 'PANEL ESTUDIANTIL' };
  };

  const getProfileRoute = () => {
    if (userRole === 'ADMINISTRADOR') return '/admin/perfil';
    if (userRole === 'ENCARGADO') return '/encargado/perfil';
    return '/estudiante/perfil';
  };

  const brand = getBrandText();

  return (
    <div className="encargado-layout">
      <header className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoUtn} alt="Logo" style={{ height: '30px' }} />
          <span style={{ fontWeight: '700', color: '#0f172a' }}>Smart Waste</span>
        </div>
        <button className="btn-menu-mobile" onClick={() => setIsMobileMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </header>

      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
            <div style={{ background: 'white', padding: '10px 15px', borderRadius: '12px', width: '100%', display: 'flex', justifyContent: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <img src={logoUtn} alt="Logo UTN" style={{ maxWidth: '100%', maxHeight: '45px', objectFit: 'contain' }} />
            </div>
            <div className="brand-text" style={{ textAlign: 'center' }}>
              <h2>{brand.title}</h2>
              <span className="brand-subtitle">{brand.subtitle}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          
          {userRole === 'ADMINISTRADOR' && (
            <>
              <NavLink to="/admin/mapa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Mapa del Campus
              </NavLink>
              <NavLink to="/admin/colecciones" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Colecciones
              </NavLink>
              <NavLink to="/admin/metricas" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Métricas
              </NavLink>
              <NavLink to="/admin/logros" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                Logros
              </NavLink>
              <NavLink to="/admin/reportes-incidencias" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Reportes
              </NavLink>
              <NavLink to="/admin/contenedores" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Contenedores
              </NavLink>
              <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Usuarios
              </NavLink>
            </>
          )}

          {userRole === 'ENCARGADO' && (
            <>
              <NavLink to="/encargado/mapa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Mapa
              </NavLink>
              <NavLink to="/encargado/recoleccion" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Recolección
              </NavLink>
              <NavLink to="/encargado/llenado" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="13" x2="9" y2="17"></line><line x1="15" y1="15" x2="15" y2="17"></line></svg>
                Llenado
              </NavLink>
            </>
          )}

          {userRole === 'ESTUDIANTE' && (
            <>
              <NavLink to="/estudiante/mapa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Mapa
              </NavLink>
              <NavLink to="/estudiante/challenges" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                <svg className="nav-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 14zm0 0L5.84 10.578a12.082 12.082 0 00-.665 6.479A11.952 11.952 0 0112 14zm0 0v7.5" /></svg>
                Logros y Metas
              </NavLink>
            </>
          )}

        </nav>

        <div className="sidebar-footer">
          <Link to={getProfileRoute()} className="user-profile-link" onClick={closeMenu}>
            {avatar ? (
              <img src={avatar.startsWith('data:') ? avatar : `data:image/png;base64,${avatar}`} alt="Avatar" className="profile-img" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar-circle" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
                <span className="avatar-initials">{initials}</span>
                <span className="online-dot"></span>
              </div>
            )}
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className="user-role">{userRole}</p>
            </div>
          </Link>

          <button className="btn-logout-full" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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

export default AppLayout;