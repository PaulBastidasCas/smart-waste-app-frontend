import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../../styles/Encargado.css';

const EncargadoLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    
    navigate('/login', { replace: true });
  };

  return (
    <div className="encargado-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <svg className="logo-icon-small" viewBox="0 0 24 24">
             <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-15.06l-4.95 4.95a1.5 1.5 0 002.12 2.12l2.48-2.48v5.97a1.5 1.5 0 003 0v-5.97l2.48 2.48a1.5 1.5 0 102.12-2.12l-4.95-4.95a1.5 1.5 0 00-2.3 0z" />
          </svg>
          <h2>UTN SMART WASTE</h2>
        </div>
        
        <div className="sidebar-user">
          <p className="user-role">Panel de Encargado</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/encargado/mapa" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon">🗺️</span> Mapa
          </NavLink>
          <NavLink to="/encargado/recoleccion" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon">🚚</span> Recolección
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
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