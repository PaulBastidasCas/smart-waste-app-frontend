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
  const [fechaRecoleccion, setFechaRecoleccion] = useState(null);
  const [encargadoNombre, setEncargadoNombre] = useState('Usuario Actual');

  const [formData, setFormData] = useState({
    facultad: null,
    contenedor: null,
    peso: '',
    observaciones: '',
    fotoBase64: null,
    clasificacionErronea: false,
    descripcionError: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      alert("Tu sesión es inválida o ha expirado.");
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
        console.error("Error al cargar facultades:", error);
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
      const response = await axios.get(`http://localhost:8080/api/contenedores/facultad/${facultadId}`, config);
      setContenedores(response.data);
    } catch (error) {
      console.error("Error al cargar contenedores:", error);
      setContenedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const selectFacultad = (fac) => {
    setFormData({
      ...formData,
      facultad: fac,
      contenedor: null,
      peso: '',
      observaciones: '',
      fotoBase64: null,
      clasificacionErronea: false,
      descripcionError: ''
    });
  };

  const irAPasoDos = () => {
    fetchContenedoresPorFacultad(formData.facultad.facId || formData.facultad.id);
    handleNext();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setFormData({ ...formData, fotoBase64: null });

  const handleRegister = async (e) => {
    e.preventDefault();
    const config = getAuthHeaders();
    if (!config) return;

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:8080/api/recolecciones/registrar', {
        contenedorId: formData.contenedor.conId || formData.contenedor.id,
        pesoRecolectado: parseFloat(formData.peso),
        observaciones: formData.observaciones,
        regFotoBase64: formData.fotoBase64,
        fotoBase64: formData.fotoBase64,
        tieneClasificacionErronea: formData.clasificacionErronea,
        descripcionError: formData.descripcionError
      }, config);

      if (response.data.encargadoNombre) {
        setEncargadoNombre(response.data.encargadoNombre);
      }

      setFechaRecoleccion(new Date());
      handleNext();
    } catch (error) {
      console.error("Error al registrar:", error);
      alert(error.response?.data?.error || "Ocurrió un error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  const calcularLlenadoActual = (capacidad, porcentaje) => {
    if (!capacidad || !porcentaje) return 0;
    return ((capacidad * porcentaje) / 100).toFixed(1);
  };

  return (
    <div className="recoleccion-container fade-in">
      <div className="recoleccion-header">
        <h2>Nueva Recolección</h2>
      </div>

      <div className="wizard-stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className={`step-circle ${step >= 1 ? 'glow' : ''}`}>1</div>
          <span>Facultad</span>
        </div>
        <div className={`step-line ${step >= 2 ? 'active-line' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className={`step-circle ${step >= 2 ? 'glow' : ''}`}>2</div>
          <span>Elegir Contenedor</span>
        </div>
        <div className={`step-line ${step >= 3 ? 'active-line' : ''}`}></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className={`step-circle ${step >= 3 ? 'glow' : ''}`}>3</div>
          <span>Confirmar</span>
        </div>
      </div>

      <div className="wizard-content">

        {/* PASO 1 */}
        {step === 1 && (
          <div className="step-1 animate-slide-up">
            <div className="step-title-row">
              <h3>Paso 1 — Selecciona la Facultad</h3>
              <span className="pill-info">{facultades.length} facultades activas</span>
            </div>

            {loading ? <p className="text-center">Cargando...</p> : (
              <div className="facultades-grid">
                {facultades.map(fac => (
                  <div
                    key={fac.facId || fac.id}
                    className={`facultad-card ${(formData.facultad?.facId || formData.facultad?.id) === (fac.facId || fac.id) ? 'selected' : ''}`}
                    onClick={() => selectFacultad(fac)}
                  >
                    <div className="fac-icon">🏢</div>
                    <h4>{fac.facCodigo || fac.codigo}</h4>
                    <p>{fac.facNombre || fac.nombre}</p>
                  </div>
                ))}
              </div>
            )}

            {formData.facultad && (
              <div className="action-row-right mt-4 animate-slide-up">
                <button className="btn-primary-r" onClick={irAPasoDos}>
                  Siguiente Paso →
                </button>
              </div>
            )}
          </div>
        )}

        {/* PASO 2 */}
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
            </div>

            <div className="step-title-row mt-4">
              <h3>Paso 2 — Elige el Contenedor</h3>
              <span className="pill-info">{contenedores.length} contenedores encontrados</span>
            </div>

            {loading ? <p className="text-center">Cargando contenedores...</p> : contenedores.length === 0 ? (
              <div className="empty-state">No hay contenedores registrados en esta facultad.</div>
            ) : (
              <div className="contenedores-grid">
                {contenedores.map(cont => (
                  <div
                    key={cont.conId || cont.id}
                    className={`contenedor-card ${(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, contenedor: cont })}
                  >
                    <div className="card-top">
                      <span className={`status-badge ${(cont.conEstadoOperativo || cont.estadoOperativo) === 'OPERATIVO' ? 'operativo' : 'lleno'}`}>
                        {cont.conEstadoOperativo || cont.estadoOperativo}
                      </span>
                      {(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) && <span className="check-icon">✓</span>}
                    </div>
                    <div className="card-center">
                      <svg width="40" height="40" className="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      <h4>{cont.conCodigo || cont.codigo}</h4>
                      {/* Etiqueta de Tipo de Residuo */}
                      <span className="badge-residuo" style={{ display: 'inline-block', background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', marginBottom: '10px', fontWeight: '600' }}>
                        🗑️ {cont.conTipoResiduo?.treNombre || "Sin clasificar"}
                      </span>
                      <p>{cont.conDescripcionUbicacion || cont.descripcionUbicacion}</p>
                    </div>
                    <div className="card-bottom">
                      <div className="progress-labels">
                        <span>
                          Cap: {cont.conCapacidadLitros || cont.capacidadLitros} L
                          <small className="text-muted"> (Lleno: {calcularLlenadoActual(cont.conCapacidadLitros || cont.capacidadLitros, cont.conNivelLlenadoPct || cont.nivelLlenadoPct)} L)</small>
                        </span>
                        <span className={(cont.conNivelLlenadoPct || cont.nivelLlenadoPct) > 80 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                          {cont.conNivelLlenadoPct || cont.nivelLlenadoPct}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${(cont.conNivelLlenadoPct || cont.nivelLlenadoPct) > 80 ? 'danger' : 'success'}`} style={{ width: `${cont.conNivelLlenadoPct || cont.nivelLlenadoPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.contenedor && (
              <form className="details-form animate-slide-up" onSubmit={handleRegister}>
                <h3 className="form-title">📄 Detalles de la Recolección</h3>

                <div className="form-row-custom">
                  <div className="form-group-r half">
                    <label>Peso/Volumen Recolectado *</label>
                    <div className="input-with-suffix">
                      <input
                        type="number" step="0.01" min="0.1"
                        value={formData.peso}
                        onChange={e => setFormData({ ...formData, peso: e.target.value })}
                        required
                        placeholder="Ingrese cantidad"
                      />
                      <span className="suffix">kg/L</span>
                    </div>
                  </div>

                  <div className="form-group-r half">
                    <label>Foto Evidencia (Opcional)</label>
                    <div className="upload-box">
                      {!formData.fotoBase64 ? (
                        <label className="upload-label">
                          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                          📷 Seleccionar Imagen
                        </label>
                      ) : (
                        <div className="preview-box">
                          <img src={formData.fotoBase64} alt="Previsualización" />
                          <button type="button" onClick={removeImage}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkbox de clasificación errónea */}
                <div className="form-group-r mt-3">
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#d9534f' }}>
                    <input
                      type="checkbox"
                      checked={formData.clasificacionErronea}
                      onChange={e => setFormData({ ...formData, clasificacionErronea: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    ⚠️ Reportar clasificación errónea de residuos
                  </label>
                </div>

                {/* Textarea que aparece si el checkbox está activo */}
                {formData.clasificacionErronea && (
                  <div className="form-group-r mt-2 animate-slide-up">
                    <label>Describa el error de clasificación *</label>
                    <textarea
                      rows="2"
                      required
                      placeholder="Ej. Hay botellas de vidrio en el contenedor de plástico..."
                      value={formData.descripcionError}
                      onChange={e => setFormData({ ...formData, descripcionError: e.target.value })}
                      style={{ borderColor: '#d9534f' }}
                    ></textarea>
                  </div>
                )}

                <div className="form-group-r mt-3">
                  <label>Observaciones (Opcional)</label>
                  <textarea rows="2" placeholder="Ej. Contenedor con daños..." value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })}></textarea>
                </div>

                <div className="form-actions mt-4">
                  <button type="submit" className="btn-primary-r full-width" disabled={!formData.peso || loading}>
                    {loading ? 'Procesando...' : 'Confirmar y Registrar ✓'}
                  </button>
                </div>
              </form>
            )}
            <div className="action-row-left mb-3">
              <button type="button" className="btn-outline" onClick={handleBack}>
                ← Paso anterior
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <div className="step-3-wrapper animate-slide-up">

            <div className="animation-container">
              <div className="animated-bin">
                <div className="bin-lid"></div>
                <div className="bin-body">
                  <span>{formData.contenedor?.conCodigo || formData.contenedor?.codigo}</span>
                </div>
                <div className="trash-pieces">
                  <div className="piece p1"></div>
                  <div className="piece p2"></div>
                  <div className="piece p3"></div>
                </div>
              </div>
            </div>

            <h2 className="text-success-dark">¡Recolección Exitosa!</h2>

            <div className="ticket-card">
              <h3>Resumen de Operación</h3>
              <div className="ticket-row">
                <span className="label">Encargado:</span>
                <span className="value">{encargadoNombre}</span>
              </div>
              <div className="ticket-row">
                <span className="label">Facultad:</span>
                <span className="value">{formData.facultad?.facCodigo || formData.facultad?.codigo}</span>
              </div>
              <div className="ticket-row">
                <span className="label">Contenedor:</span>
                <span className="value">{formData.contenedor?.conCodigo || formData.contenedor?.codigo}</span>
              </div>
              <div className="ticket-row highlight">
                <span className="label">Total Recolectado:</span>
                <span className="value">{formData.peso} kg/L</span>
              </div>
              <div className="ticket-row">
                <span className="label">Fecha y Hora:</span>
                <span className="value">{fechaRecoleccion?.toLocaleString()}</span>
              </div>

              {/* Alerta en el ticket si se reportó error de clasificación */}
              {formData.clasificacionErronea && (
                <div className="ticket-row mt-2" style={{ backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px' }}>
                  <span className="label text-danger" style={{ fontWeight: 'bold' }}>⚠️ Alerta de Clasificación:</span>
                  <span className="value text-danger text-right" style={{ maxWidth: '60%', textAlign: 'right' }}>
                    {formData.descripcionError}
                  </span>
                </div>
              )}

              {formData.observaciones && (
                <div className="ticket-row mt-2">
                  <span className="label">Observaciones:</span>
                  <span className="value text-right" style={{ maxWidth: '60%', textAlign: 'right' }}>{formData.observaciones}</span>
                </div>
              )}

              {formData.fotoBase64 && (
                <div className="ticket-photo">
                  <span className="label-photo">Foto Adjunta:</span>
                  <img src={formData.fotoBase64} alt="Evidencia" />
                </div>
              )}
            </div>

            <button className="btn-primary-r mt-4" onClick={() => {
              setStep(1);
              setEncargadoNombre('Usuario Actual');
              setFormData({
                facultad: null,
                contenedor: null,
                peso: '',
                observaciones: '',
                fotoBase64: null,
                clasificacionErronea: false,
                descripcionError: ''
              });
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