import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/Recoleccion.css';

const Recoleccion = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [facultades, setFacultades] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaRecoleccion, setFechaRecoleccion] = useState(null);
  const [encargadoNombre, setEncargadoNombre] = useState('');

  const [formData, setFormData] = useState({
    facultad: null,
    contenedor: null,
    peso: '',
    observaciones: '',
    fotoBase64: null,
    clasificacionErronea: false,
    descripcionError: ''
  });

  useEffect(() => {
    const fetchFacultades = async () => {
      try {
        setLoading(true);
        const response = await api.get('/catalogos/facultades');
        setFacultades(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultades();
  }, []);

  const fetchContenedoresPorFacultad = async (facultadId) => {
    try {
      setLoading(true);
      const response = await api.get(`/contenedores/facultad/${facultadId}`);
      setContenedores(response.data);
    } catch (error) {
      setContenedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const selectFacultad = (fac) => {
    setFormData({ ...formData, facultad: fac, contenedor: null, peso: '', observaciones: '', fotoBase64: null, clasificacionErronea: false, descripcionError: '' });
  };

  const irAPasoDos = () => {
    fetchContenedoresPorFacultad(formData.facultad.facId || formData.facultad.id);
    handleNext();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, fotoBase64: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setFormData({ ...formData, fotoBase64: null });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/recolecciones/registrar', {
        contenedorId: formData.contenedor.conId || formData.contenedor.id,
        pesoRecolectado: parseFloat(formData.peso),
        observaciones: formData.observaciones,
        regFotoBase64: formData.fotoBase64,
        tieneClasificacionErronea: formData.clasificacionErronea,
        descripcionError: formData.descripcionError
      });

      if (response.data.encargadoNombre) setEncargadoNombre(response.data.encargadoNombre);
      setFechaRecoleccion(new Date());
      handleNext();
    } catch (error) {
      alert(error.response?.data?.error || "Error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  const calcularLlenadoLitros = (capacidad, porcentaje) => capacidad && porcentaje ? ((capacidad * porcentaje) / 100).toFixed(1) : 0;
  const calcularKg = (litros, factor) => (parseFloat(litros || 0) * (parseFloat(factor) || 1)).toFixed(1);

  const BuildingIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
    </svg>
  );

  const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
      <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

  const CameraIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>
    </svg>
  );

  const AlertIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );

  const DocumentIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', marginBottom: '-2px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const ArrowLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  return (
    <div className="vista-separada-container fade-in">

      <div className="card-section header-stepper-section">
        <h2 className="section-title">Nueva Recolección</h2>

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
      </div>

      <div className="card-section content-section">
        <div className="wizard-content">

          {step === 1 && (
            <div className="step-1 animate-slide-up">
              <div className="step-title-row">
                <h3>Paso 1 — Selecciona la Facultad</h3>
                <span className="pill-info">{facultades.length} facultades activas</span>
              </div>

              {loading ? <p className="text-center">Cargando...</p> : (
                <div className="facultades-grid">
                  {facultades.map(fac => (
                    <div key={fac.facId || fac.id} className={`facultad-card ${(formData.facultad?.facId || formData.facultad?.id) === (fac.facId || fac.id) ? 'selected' : ''}`} onClick={() => selectFacultad(fac)}>
                      <div className="icon-wrapper"><BuildingIcon /></div>
                      <h4>{fac.facCodigo || fac.codigo}</h4>
                      <p>{fac.facNombre || fac.nombre}</p>
                    </div>
                  ))}
                </div>
              )}

              {formData.facultad && (
                <div className="action-row-right animate-slide-up">
                  <button className="btn-primary-r" onClick={irAPasoDos}>Siguiente Paso</button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="step-2 animate-slide-up">
              <div className="selected-faculty-banner">
                <BuildingIcon />
                <span>
                  <strong>Facultad Seleccionada:</strong> {formData.facultad?.facCodigo || formData.facultad?.codigo} - {formData.facultad?.facNombre || formData.facultad?.nombre}
                </span>
              </div>

              <div className="action-row-left">
                <button type="button" className="btn-back" onClick={handleBack}>
                  <ArrowLeftIcon />
                  Volver a Facultades
                </button>
              </div>

              <div className="step-title-row">
                <h3>Paso 2 — Elige el Contenedor</h3>
                <span className="pill-info">{contenedores.length} contenedores encontrados</span>
              </div>

              {loading ? <p className="text-center">Cargando contenedores...</p> : contenedores.length === 0 ? (
                <div className="empty-state">No hay contenedores registrados en esta facultad.</div>
              ) : (
                <div className="contenedores-grid">
                  {contenedores.map(cont => {
                    const capacidadL = cont.conCapacidadLitros || cont.capacidadLitros || 0;
                    const nivelPct = cont.conNivelLlenadoPct || cont.nivelLlenadoPct || 0;
                    const factorKg = cont.conTipoResiduo?.treFactorKgUnidad || cont.tipoResiduo?.factorKgUnidad || 1;
                    const llenoL = calcularLlenadoLitros(capacidadL, nivelPct);
                    const capacidadKg = calcularKg(capacidadL, factorKg);
                    const llenoKg = calcularKg(llenoL, factorKg);

                    const estadoLlenado = cont.conEstadoLlenado || cont.estadoLlenado || 'VACIO';
                    const isVacio = nivelPct === 0;

                    return (
                      <div
                        key={cont.conId || cont.id}
                        className={`contenedor-card ${(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) ? 'selected' : ''} ${isVacio ? 'disabled-card' : ''}`}
                        onClick={() => {
                          if (!isVacio) setFormData({ ...formData, contenedor: cont });
                        }}
                      >
                        <div className="card-top">
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className={`status-badge ${(cont.conEstadoOperativo || cont.estadoOperativo) === 'OPERATIVO' ? 'operativo' : 'mantenimiento'}`}>
                              {cont.conEstadoOperativo || cont.estadoOperativo}
                            </span>
                            <span className={`status-badge llenado-${estadoLlenado.toLowerCase()}`}>
                              {estadoLlenado}
                            </span>
                          </div>
                        </div>
                        <div className="card-center">
                          <div className="icon-wrapper"><TrashIcon /></div>
                          <h4>{cont.conCodigo || cont.codigo}</h4>
                          <span className="badge-residuo">
                            {cont.conTipoResiduo?.treNombre || cont.tipoResiduo?.nombre || "Sin clasificar"}
                          </span>
                          <p>{cont.conDescripcionUbicacion || cont.descripcionUbicacion}</p>
                        </div>
                        <div className="card-bottom">
                          <div className="progress-labels">
                            <span style={{ fontSize: '0.65rem', lineHeight: '1.4' }}>
                              Cap: {capacidadL} L <span className="text-muted">({capacidadKg} kg)</span><br />
                              <small className="text-muted">Lleno: {llenoL} L <span style={{ fontWeight: '600' }}>({llenoKg} kg)</span></small>
                            </span>
                            <span className={nivelPct > 80 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{nivelPct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className={`progress-fill ${nivelPct > 80 ? 'danger' : 'success'}`} style={{ width: `${nivelPct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {formData.contenedor && (
                <form className="details-form animate-slide-up" onSubmit={handleRegister}>
                  <h3 className="form-title"><DocumentIcon /> Detalles de la Recolección</h3>
                  <div className="form-row-custom">
                    <div className="form-group-r half">
                      <label>Peso/Volumen Recolectado *</label>
                      <div className="input-with-suffix">
                        <input type="number" step="0.01" min="0.1" value={formData.peso} onChange={e => setFormData({ ...formData, peso: e.target.value })} required placeholder="Ingrese cantidad" />
                        <span className="suffix">kg/L</span>
                      </div>
                    </div>
                    <div className="form-group-r half">
                      <label>Foto Evidencia (Opcional)</label>
                      <div className="upload-box">
                        {!formData.fotoBase64 ? (
                          <label className="upload-label">
                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                            <CameraIcon /> Seleccionar Imagen
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
                  <div className="form-group-r">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.clasificacionErronea} onChange={e => setFormData({ ...formData, clasificacionErronea: e.target.checked })} />
                      <AlertIcon /> Reportar clasificación errónea de residuos
                    </label>
                  </div>
                  {formData.clasificacionErronea && (
                    <div className="form-group-r animate-slide-up">
                      <label>Describa el error *</label>
                      <textarea rows="2" required placeholder="Ej. Hay botellas de vidrio en el plástico..." value={formData.descripcionError} onChange={e => setFormData({ ...formData, descripcionError: e.target.value })}></textarea>
                    </div>
                  )}
                  <div className="form-group-r">
                    <label>Observaciones (Opcional)</label>
                    <textarea rows="2" placeholder="Ej. Contenedor dañado..." value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })}></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary-r full-width" disabled={!formData.peso || loading}>
                      {loading ? 'Procesando...' : 'Confirmar y Registrar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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

              <h2 className="text-success-dark">Recolección Exitosa</h2>
              <div className="ticket-card">
                <h3>Resumen de Operación</h3>
                <div className="ticket-row">
                  <span className="label">Encargado:</span>
                  <span className="value">{encargadoNombre || 'Usuario Actual'}</span>
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

                {formData.clasificacionErronea && (
                  <div className="ticket-row alert-box" style={{ marginTop: '6px' }}>
                    <span className="label text-danger">Alerta de Clasificación:</span>
                    <span className="value text-danger text-right">{formData.descripcionError}</span>
                  </div>
                )}

                {formData.observaciones && (
                  <div className="ticket-row" style={{ marginTop: '6px' }}>
                    <span className="label">Observaciones:</span>
                    <span className="value text-right" style={{ maxWidth: '60%', textAlign: 'right', fontWeight: 'normal' }}>{formData.observaciones}</span>
                  </div>
                )}

                {formData.fotoBase64 && (
                  <div className="ticket-photo">
                    <span className="label-photo">Foto Adjunta:</span>
                    <img src={formData.fotoBase64} alt="Evidencia" />
                  </div>
                )}
              </div>
              <button className="btn-primary-r" onClick={() => {
                setStep(1); setFormData({ facultad: null, contenedor: null, peso: '', observaciones: '', fotoBase64: null, clasificacionErronea: false, descripcionError: '' });
              }}>Registrar Otra Recolección</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recoleccion;