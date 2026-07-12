import React, { useState } from 'react';
import '../styles/Login.css';
import { login, register, solicitarRecuperacion } from '../services/authService';

const Login = () => {
  const [view, setView] = useState('login');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const [regData, setRegData] = useState({
    tipoIdentificacionId: '1', identificacion: '', nombre: '', apellido: '', correo: '', password: '', facultadId: '1'
  });

  const [uiState, setUiState] = useState({ error: '', success: '', loading: false });
  const [showPassword, setShowPassword] = useState(false);

  const clearMessages = () => setUiState({ error: '', success: '', loading: false });
  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setUiState(prev => ({ ...prev, loading: true }));
    try {
      const response = await login({ correo, password });
      console.log('Login exitoso, token:', response.token);
    } catch (err) {
      setUiState({ error: 'Credenciales incorrectas', success: '', loading: false });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    setUiState(prev => ({ ...prev, loading: true }));
    try {
      await register(regData);
      setUiState({ error: '', success: '¡Registro exitoso! Por favor, inicia sesión.', loading: false });
      setView('login');
      setCorreo(regData.correo);
    } catch (err) {
      setUiState({ error: err.response?.data?.message || 'Error al registrar usuario', success: '', loading: false });
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    clearMessages();
    setUiState(prev => ({ ...prev, loading: true }));
    try {
      await solicitarRecuperacion(correo);
      setUiState({ error: '', success: 'Si el correo existe, te hemos enviado un enlace de recuperación.', loading: false });
      setTimeout(() => { setView('login'); clearMessages(); }, 4000);
    } catch (err) {
      setUiState({ error: 'Error al procesar la solicitud', success: '', loading: false });
    }
  };

  const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });

  const renderView = () => {
    if (view === 'login') {
      return (
        <div className="view-content animate-slide-up">
          <div className="login-header">
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales para continuar</p>
            <div className="divider"></div>
          </div>
          {uiState.success && <div className="success-banner">{uiState.success}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo Institucional</label>
              <input type="email" placeholder="ejemplo@utn.edu.ec" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>
            <div className="form-group">
              <div className="label-row">
                <label>Contraseña</label>
                <span className="forgot-link pointer" onClick={() => { setView('forgot'); clearMessages(); }}>¿Olvidaste tu contraseña?</span>
              </div>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {/* Botón corregido: Se eliminó la etiqueta <button> duplicada[cite: 4] */}
                <button type="button" className="eye-btn" onClick={togglePassword}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {uiState.error && <p className="error-text">{uiState.error}</p>}
            <button type="submit" className="btn-submit" disabled={uiState.loading}>
              {uiState.loading ? <span className="spinner"></span> : 'Iniciar Sesión'}
            </button>
            <p className="switch-view-text">
              ¿No tienes cuenta? <span className="pointer bold-link" onClick={() => { setView('register'); clearMessages(); }}>Regístrate aquí</span>
            </p>
          </form>
        </div>
      );
    }

    if (view === 'register') {
      return (
        <div className="view-content animate-slide-up">
          <div className="login-header">
            <h2>Crear Cuenta</h2>
            <p>Únete a la gestión ecológica del campus</p>
            <div className="divider"></div>
          </div>
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-row">
              <div className="form-group half">
                <label>Tipo Doc.</label>
                <select name="tipoIdentificacionId" value={regData.tipoIdentificacionId} onChange={handleRegChange}>
                  <option value="1">Cédula</option><option value="2">Pasaporte</option><option value="3">RUC</option>
                </select>
              </div>
              <div className="form-group half">
                <label>Identificación</label>
                <input type="text" name="identificacion" placeholder="Ej: 1002003004" value={regData.identificacion} onChange={handleRegChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Nombre</label>
                <input type="text" name="nombre" placeholder="Nombre" value={regData.nombre} onChange={handleRegChange} required />
              </div>
              <div className="form-group half">
                <label>Apellido</label>
                <input type="text" name="apellido" placeholder="Apellido" value={regData.apellido} onChange={handleRegChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Correo Institucional</label>
              <input type="email" name="correo" placeholder="ejemplo@utn.edu.ec" value={regData.correo} onChange={handleRegChange} required />
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Contraseña</label>
                <div className="password-wrapper">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={regData.password} onChange={handleRegChange} required />
                  <button type="button" className="eye-btn" onClick={togglePassword}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group half">
                <label>Facultad</label>
                <select name="facultadId" value={regData.facultadId} onChange={handleRegChange}>
                  <option value="1">FACAE</option><option value="2">FICA</option><option value="3">FECYT</option><option value="4">POSTGRADO</option>
                </select>
              </div>
            </div>
            {uiState.error && <p className="error-text">{uiState.error}</p>}
            <button type="submit" className="btn-submit" disabled={uiState.loading}>
              {uiState.loading ? <span className="spinner"></span> : 'Registrarse'}
            </button>
            <p className="switch-view-text">
              ¿Ya tienes cuenta? <span className="pointer bold-link" onClick={() => { setView('login'); clearMessages(); }}>Volver al Login</span>
            </p>
          </form>
        </div>
      );
    }

    if (view === 'forgot') {
      return (
        <div className="view-content animate-slide-up">
          <div className="login-header">
            <h2>Recuperar Contraseña</h2>
            <p>Ingresa tu correo para enviarte un enlace seguro</p>
            <div className="divider"></div>
          </div>
          {uiState.success ? (
            <div className="success-banner">{uiState.success}</div>
          ) : (
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label>Correo Institucional</label>
                <input type="email" placeholder="ejemplo@utn.edu.ec" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
              </div>
              {uiState.error && <p className="error-text">{uiState.error}</p>}
              <button type="submit" className="btn-submit" disabled={uiState.loading}>
                {uiState.loading ? <span className="spinner"></span> : 'Enviar Enlace'}
              </button>
            </form>
          )}
          <p className="switch-view-text mt-2">
            <span className="pointer bold-link" onClick={() => { setView('login'); clearMessages(); }}>← Volver al Login</span>
          </p>
        </div>
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="eco-blob-container">
          <div className="eco-blob-login">
            <svg className="logo-icon-login" viewBox="0 0 24 24">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-15.06l-4.95 4.95a1.5 1.5 0 002.12 2.12l2.48-2.48v5.97a1.5 1.5 0 003 0v-5.97l2.48 2.48a1.5 1.5 0 102.12-2.12l-4.95-4.95a1.5 1.5 0 00-2.3 0z" />
            </svg>
          </div>
        </div>
        <h1>UTN Smart Waste</h1>
        <p>Gestión Ecológica Inteligente del Campus El Olivo</p>
        <div className="tags">
          <span className="eco-tag">♻️ Reciclaje</span>
          <span className="eco-tag">📊 Métricas</span>
          <span className="eco-tag">🌱 Campus</span>
        </div>
      </div>
      <div className="login-right">
        {renderView()}
        <div className="login-footer">
          <p className="copyright">© 2026 Universidad Técnica del Norte. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;