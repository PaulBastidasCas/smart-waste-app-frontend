import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar Eco */}
      <nav className="landing-nav fade-in-down">
        <div className="nav-logo">
          <svg className="logo-icon-small" viewBox="0 0 24 24">
             <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-15.06l-4.95 4.95a1.5 1.5 0 002.12 2.12l2.48-2.48v5.97a1.5 1.5 0 003 0v-5.97l2.48 2.48a1.5 1.5 0 102.12-2.12l-4.95-4.95a1.5 1.5 0 00-2.3 0z" />
          </svg>
          <span className="font-bold">UTN Smart Waste</span>
        </div>
      </nav>

      {/* Hero Section Orgánico */}
      <header className="hero-section">
        <div className="hero-content fade-in-up">
          <div className="eco-badge">🌿 Por un campus sostenible</div>
          <h1 className="hero-title">
            Dale una segunda vida a tus <span className="highlight-green">residuos</span>
          </h1>
          <p className="hero-subtitle">
            Monitoreo inteligente, gamificación y datos en tiempo real para transformar la manera en que la UTN clasifica y recicla.
          </p>
          <button className="btn-eco pulse-anim" onClick={() => navigate('/login')}>
            Ingresar a la Plataforma
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon-right">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div className="hero-visual">
          <div className="composition-container">
            {/* Forma de "Blob" orgánica en lugar de círculo estricto */}
            <div className="eco-blob float-slow">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon-gigant">
                <path d="M19.41 7.41l-4.83-4.83c-.78-.78-2.05-.78-2.83 0l-4.83 4.83c-.78.78-.78 2.05 0 2.83l4.83 4.83c.78.78 2.05.78 2.83 0l4.83-4.83c.79-.78.79-2.05 0-2.83zm-6.24 3.41L10 7.64l3.17-3.17 3.17 3.17-3.17 3.18z"/>
              </svg>
            </div>
            {/* Tarjetas de telemetría */}
            <div className="floating-card card-1 float-fast">
              <span className="emoji">♻️</span> FACAE: 85% Lleno
            </div>
            <div className="floating-card card-2 float-medium">
              <span className="emoji">📊</span> Telemetría Activa
            </div>
          </div>
        </div>
      </header>

      {/* Sección de Impacto (Estilo Ecoembes/ReciVeci) */}
      <section id="impacto" className="impact-section fade-in">
        <div className="impact-grid">
          <div className="impact-stat">
            <h2 className="stat-number">100%</h2>
            <p className="stat-label">Monitoreo Virtual</p>
          </div>
          <div className="impact-stat">
            <h2 className="stat-number">0</h2>
            <p className="stat-label">Papel en Vertederos</p>
          </div>
          <div className="impact-stat">
            <h2 className="stat-number">+2</h2>
            <p className="stat-label">Facultades Conectadas</p>
          </div>
        </div>
      </section>

      {/* Objetivos */}
      <section id="objetivos" className="goals-section fade-in">
        <div className="goals-header">
          <h2>Nuestros Ejes de Acción</h2>
          <p>Tecnología y concientización trabajando juntas para un campus El Olivo más limpio.</p>
        </div>
        
        <div className="cards-grid">
          <div className="goal-card stagger-1">
            <div className="card-icon eco-light">📱</div>
            <h3>Dashboard Analítico</h3>
            <p>Visualiza en tiempo real los picos de generación de residuos en FACAE y Postgrado para optimizar la recolección.</p>
          </div>
          
          <div className="goal-card stagger-2">
            <div className="card-icon eco-light">🎯</div>
            <h3>Gamificación</h3>
            <p>Metas comunitarias públicas que motivan a los estudiantes a mejorar sus hábitos de separación en la fuente.</p>
          </div>
          
          <div className="goal-card stagger-3">
            <div className="card-icon eco-light">🌱</div>
            <h3>Economía Circular</h3>
            <p>Traducimos los kilogramos de material recuperado en impacto social y económico tangible para la universidad.</p>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="eco-footer">
        <p>© 2026 Universidad Técnica del Norte. Proyecto Smart Waste.</p>
      </footer>
    </div>
  );
};

export default Landing;