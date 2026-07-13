import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/Recoleccion.css';

const Recoleccion = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [facultades, setFacultades] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    facultad: null,
    contenedor: null,
    peso: '',
    observaciones: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      alert("Tu sesión es inválida o ha expirado. Por favor, inicia sesión nuevamente.");
      navigate('/login', { replace: true });
      return null;
    }
    return { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    };
  };

  useEffect(() => {
    const fetchFacultades = async () => {
      const config = getAuthHeaders();
      if (!config) return;

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/catalogos/facultades', config);
        setFacultades(response.data);
      } catch (error) {
        console.error("🚨 Error al cargar facultades:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFacultades();
  }, [navigate]);

  const fetchContenedoresPorFacultad = async (facultadId) => {
    const config = getAuthHeaders();
    if (!config) return;

    try {
      setLoading(true);
      // Usamos la variable correcta que le pasamos desde la función selectFacultad
      const response = await axios.get(`http://localhost:8080/api/contenedores/facultad/${facultadId}`, config);
      setContenedores(response.data);
    } catch (error) {
      console.error("🚨 Error al cargar contenedores:", error);
      setContenedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const selectFacultad = (fac) => {
    setFormData({ ...formData, facultad: fac, contenedor: null, peso: '' });
    // Usamos fac.facId (o fac.id dependiendo de tu modelo en Java)
    fetchContenedoresPorFacultad(fac.facId || fac.id);
    handleNext();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const config = getAuthHeaders();
    if (!config) return;

    try {
      setLoading(true);
      await axios.post('http://localhost:8080/api/recolecciones/registrar', {
        contenedorId: formData.contenedor.conId || formData.contenedor.id, // Variable corregida
        pesoRecolectado: parseFloat(formData.peso),
        observaciones: formData.observaciones
      }, config);
      
      handleNext(); 
    } catch (error) {
      console.error("🚨 Error al registrar recolección:", error.response || error);
      alert(error.response?.data?.error || "Ocurrió un error al registrar la recolección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recoleccion-container fade-in">
      <div className="recoleccion-header">
        <h2>Nueva Recolección</h2>
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Buscar contenedores..." />
        </div>
      </div>

      <div className="wizard-stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          {step >= 1 ? <div className="step-circle">1</div> : <div className="step-number">1</div>}
          <span>Facultad</span>
        </div>
        <div className={`step-line ${step >= 2 ? 'active-line' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          {step >= 2 ? <div className="step-circle">2</div> : <div className="step-number">2</div>}
          <span>Elegir Contenedor</span>
        </div>
        <div className={`step-line ${step >= 3 ? 'active-line' : ''}`}></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          {step >= 3 ? <div className="step-circle">3</div> : <div className="step-number">3</div>}
          <span>Confirmar</span>
        </div>
      </div>

      <div className="wizard-content">
        {step === 1 && (
          <div className="step-1 animate-slide-up">
            <div className="step-title-row">
              <h3>Paso 1 — Selecciona la Facultad</h3>
              <span className="pill-info">{facultades.length} facultades activas</span>
            </div>
            
            {loading ? <p>Cargando facultades...</p> : facultades.length === 0 ? (
              <div className="empty-state">No se pudieron cargar las facultades. Revisa la consola.</div>
            ) : (
              <div className="facultades-grid">
                {facultades.map(fac => (
                  <div key={fac.facId || fac.id} className="facultad-card" onClick={() => selectFacultad(fac)}>
                    <div className="fac-icon">🏢</div>
                    {/* Variables cambiadas a camelCase */}
                    <h4>{fac.facCodigo || fac.codigo}</h4>
                    <p>{fac.facNombre || fac.nombre}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-2 animate-slide-up">
            <div className="selected-banner">
              <div className="banner-info">
                <div className="banner-icon">🏢</div>
                <div>
                  <h4>Facultad: {formData.facultad?.facCodigo || formData.facultad?.codigo}</h4>
                  <p>{formData.facultad?.facNombre || formData.facultad?.nombre}</p>
                </div>
              </div>
              <button className="btn-text" onClick={() => setStep(1)}>✎ Cambiar</button>
            </div>

            <div className="step-title-row">
              <h3>Paso 2 — Elige el Contenedor</h3>
              <span className="pill-info">{contenedores.length} contenedores encontrados</span>
            </div>

            {loading ? <p>Cargando contenedores...</p> : contenedores.length === 0 ? (
              <div className="empty-state">No hay contenedores registrados en esta facultad.</div>
            ) : (
              <div className="contenedores-grid">
                {contenedores.map(cont => (
                  <div 
                    key={cont.conId || cont.id} 
                    className={`contenedor-card ${(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, contenedor: cont})}
                  >
                    <div className="card-top">
                      <span className={`status-badge ${(cont.conEstadoOperativo || cont.estadoOperativo) === 'OPERATIVO' ? 'operativo' : 'lleno'}`}>
                        {cont.conEstadoOperativo || cont.estadoOperativo}
                      </span>
                      {(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) && <span className="check-icon">✓</span>}
                    </div>
                    <div className="card-center">
                      <svg className="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      <h4>{cont.conCodigo || cont.codigo}</h4>
                      <p>{cont.conDescripcionUbicacion || cont.descripcionUbicacion}</p>
                    </div>
                    <div className="card-bottom">
                      <div className="progress-labels">
                        <span>Capacidad: {cont.conCapacidadLitros || cont.capacidadLitros} L</span>
                        <span className={(cont.conNivelLlenadoPct || cont.nivelLlenadoPct) > 80 ? 'text-danger' : 'text-success'}>
                          {cont.conNivelLlenadoPct || cont.nivelLlenadoPct}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${(cont.conNivelLlenadoPct || cont.nivelLlenadoPct) > 80 ? 'danger' : 'success'}`} style={{width: `${cont.conNivelLlenadoPct || cont.nivelLlenadoPct}%`}}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.contenedor && (
              <form className="details-form animate-slide-up" onSubmit={handleRegister}>
                <h3 className="form-title">📄 Detalles de la Recolección</h3>
                
                <div className="form-group-r">
                  <label>Peso/Volumen Recolectado</label>
                  <div className="input-with-suffix">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.1" 
                      value={formData.peso} 
                      onChange={e => setFormData({...formData, peso: e.target.value})} 
                      required 
                      placeholder="Ingrese cantidad" 
                    />
                    <span className="suffix">kg/L</span>
                  </div>
                </div>

                <div className="form-group-r">
                  <label>Observaciones (Opcional)</label>
                  <textarea rows="3" placeholder="Ej. Contenedor con daños físicos..." value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})}></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-outline" onClick={handleBack}>← Paso anterior</button>
                  <button type="submit" className="btn-primary-r" disabled={!formData.peso || loading}>
                    {loading ? 'Procesando...' : 'Confirmar y Registrar ✓'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-3 animate-slide-up text-center">
            <div className="success-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2>¡Recolección Exitosa!</h2>
            <p className="text-gray mb-2">
              Se ha registrado la recolección de <strong>{formData.peso}</strong> en el <strong>{formData.contenedor?.conCodigo || formData.contenedor?.codigo}</strong>. <br/>
              El nivel de llenado ha sido actualizado en el sistema.
            </p>
            <button className="btn-primary-r mt-2" onClick={() => {
              setStep(1);
              setFormData({ facultad: null, contenedor: null, peso: '', observaciones: '' });
            }}>
              Registrar Otra Recolección
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recoleccion;