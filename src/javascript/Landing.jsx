import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';
import logoUtn from '../assets/logo-utn.png'; 

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="landing-nav fade-in-down">
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logoUtn} 
            alt="Logo UTN" 
            style={{ height: '35px', width: 'auto', objectFit: 'contain' }} 
          />
          <span className="font-bold" style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '12px' }}>
            Smart Waste
          </span>
        </div>
      </nav>

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
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="hero-visual">
          <div className="composition-container">
            <div className="eco-blob float-slow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                background: 'white', 
                borderRadius: '50%', 
                width: '140px', 
                height: '140px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                padding: '15px'
              }}>
                <img 
                  src={logoUtn} 
                  alt="Logo UTN" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

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

      <footer className="eco-footer">
        <p>© 2026 Universidad Técnica del Norte. Proyecto Smart Waste.</p>
      </footer>
    </div>
  );
};

export default Landing;