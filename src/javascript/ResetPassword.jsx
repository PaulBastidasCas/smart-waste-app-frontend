import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { restablecerPassword } from '../services/authService';
import '../styles/Login.css';
import logoUtn from '../assets/logo-utn.png';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [uiState, setUiState] = useState({ error: '', success: '', loading: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setUiState({ error: 'Las contraseñas no coinciden', success: '', loading: false });
        }

        setUiState({ error: '', success: '', loading: true });
        try {
            await restablecerPassword(token, password);
            setUiState({ error: '', success: '¡Contraseña actualizada con éxito!', loading: false });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setUiState({ error: 'El enlace es inválido o ha expirado.', success: '', loading: false });
        }
    };

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="eco-blob-container">
                    <div className="eco-blob-login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#ffffff', borderRadius: '50%', width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', padding: '30px' }}>
                            <img src={logoUtn} alt="Logo UTN" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
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
                <div className="view-content animate-slide-up">
                    <div className="login-header">
                        <h2>Nueva Contraseña</h2>
                        <p>Ingresa tu nueva contraseña de acceso</p>
                        <div className="divider"></div>
                    </div>
                    {uiState.success ? (
                        <div className="success-banner">{uiState.success}<br />Redirigiendo al login...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <div className="password-wrapper">
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                            <div className="form-group">
                                <label>Confirmar Contraseña</label>
                                <div className="password-wrapper">
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                            </div>
                            {uiState.error && <p className="error-text">{uiState.error}</p>}
                            <button type="submit" className="btn-submit" disabled={uiState.loading}>
                                {uiState.loading ? <span className="spinner"></span> : 'Actualizar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;