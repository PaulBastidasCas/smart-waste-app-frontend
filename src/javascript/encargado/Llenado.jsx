import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Recoleccion.css';

const SimuladorSensor = () => {
    const [step, setStep] = useState(1);
    const [facultades, setFacultades] = useState([]);
    const [contenedores, setContenedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fechaActualizacion, setFechaActualizacion] = useState(null);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const [formData, setFormData] = useState({
        facultad: null,
        contenedor: null,
        pesoAgregado: '',
        reportarError: false,
        descripcionError: ''
    });

    const getEspacioLibre = () => {
        if (!formData.contenedor) return 0;
        const capacidadTotal = formData.contenedor.conCapacidadLitros || 0;
        const nivelActualPct = formData.contenedor.conNivelLlenadoPct || 0;
        const volumenActual = (capacidadTotal * nivelActualPct) / 100;
        return capacidadTotal - volumenActual;
    };

    const espacioLibre = getEspacioLibre();

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                setLoading(true);
                const response = await api.get('/catalogos/facultades');
                setFacultades(response.data);
            } catch (error) {
                console.error("Error al cargar facultades:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFacultades();
    }, []);

    const fetchContenedores = async (facultadId) => {
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

    const selectFacultad = (fac) => {
        setFormData({ ...formData, facultad: fac, contenedor: null, pesoAgregado: '', reportarError: false, descripcionError: '' });
    };

    const irAPasoDos = () => {
        fetchContenedores(formData.facultad.facId || formData.facultad.id);
        setStep(2);
    };

    const handleActualizar = async (e) => {
        e.preventDefault();

        const pesoIngresado = parseFloat(formData.pesoAgregado);
        if (pesoIngresado > espacioLibre) {
            alert(`⚠️ Error: Capacidad excedida.\n\nEl contenedor solo tiene ${espacioLibre.toFixed(1)} kg/L de espacio libre disponible. No puedes ingresar ${pesoIngresado} kg/L.`);
            return;
        }

        try {
            setLoading(true);
            const contenedorId = formData.contenedor.conId || formData.contenedor.id;

            await api.patch(`/contenedores/${contenedorId}/simular-sensor`, {
                pesoAgregado: pesoIngresado,
                reportarError: formData.reportarError,
                descripcionError: formData.descripcionError
            });

            setFechaActualizacion(new Date());
            setStep(3);
        } catch (error) {
            alert(error.response?.data?.mensaje || "Error al simular el sensor.");
        } finally {
            setLoading(false);
        }
    };

    const BuildingIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
        </svg>
    );

    const WifiIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
    );

    const AlertIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
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
                <h2 className="section-title">Llenado De Contenedores</h2>
                <div className="wizard-stepper">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}><div className={`step-circle ${step >= 1 ? 'glow' : ''}`}>1</div><span>Facultad</span></div>
                    <div className={`step-line ${step >= 2 ? 'active-line' : ''}`}></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}><div className={`step-circle ${step >= 2 ? 'glow' : ''}`}>2</div><span>Seleccionar Contenedor</span></div>
                    <div className={`step-line ${step >= 3 ? 'active-line' : ''}`}></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}><div className={`step-circle ${step >= 3 ? 'glow' : ''}`}>3</div><span>Transmisión</span></div>
                </div>
            </div>

            <div className="card-section content-section">
                <div className="wizard-content">

                    {step === 1 && (
                        <div className="step-1 animate-slide-up">
                            <div className="step-title-row">
                                <h3>Paso 1 — Selecciona la Facultad</h3>
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
                            {formData.facultad && <div className="action-row-right"><button className="btn-primary-r" onClick={irAPasoDos}>Siguiente Paso</button></div>}
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
                                <h3>Paso 2 — Actualiza los Datos del Contenedor</h3>
                            </div>

                            {loading ? <p className="text-center">Cargando contenedores...</p> : contenedores.length === 0 ? (
                                <div className="empty-state">No hay contenedores registrados.</div>
                            ) : (
                                <div className="contenedores-grid">
                                    {contenedores.map(cont => {
                                        const nivelPct = cont.conNivelLlenadoPct || 0;
                                        const estadoLlenado = cont.conEstadoLlenado || 'VACIO';
                                        const isLleno = nivelPct >= 100 || estadoLlenado === 'CRITICO';

                                        return (
                                            <div key={cont.conId || cont.id} className={`contenedor-card ${(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) ? 'selected' : ''} ${isLleno ? 'disabled-card' : ''}`}
                                                onClick={() => { if (!isLleno) setFormData({ ...formData, contenedor: cont }); }}>
                                                <div className="card-top">
                                                    <span className={`status-badge ${(cont.conEstadoOperativo) === 'OPERATIVO' ? 'operativo' : 'mantenimiento'}`}>{cont.conEstadoOperativo || 'OPERATIVO'}</span>
                                                    <span className={`status-badge llenado-${estadoLlenado.toLowerCase()}`}>{estadoLlenado}</span>
                                                </div>
                                                <div className="card-center">
                                                    <div className="icon-wrapper"><WifiIcon /></div>
                                                    <h4>{cont.conCodigo}</h4>
                                                    <p>{isLleno ? 'Contenedor Lleno (Sensor Bloqueado)' : 'Sensor Activo'}</p>
                                                </div>
                                                <div className="card-bottom">
                                                    <div className="progress-labels">
                                                        <span style={{ fontSize: '0.65rem' }}>Cap: {cont.conCapacidadLitros}L</span>
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
                                <form className="details-form animate-slide-up" onSubmit={handleActualizar}>
                                    <h3 className="form-title"><WifiIcon /> Transmitir Datos</h3>
                                    <div className="form-row-custom">
                                        <div className="form-group-r half">
                                            <label>Simular Ingreso de Peso (kg/L) *</label>
                                            <div className="input-with-suffix">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.1"
                                                    max={espacioLibre.toFixed(2)}
                                                    value={formData.pesoAgregado}
                                                    onChange={e => setFormData({ ...formData, pesoAgregado: e.target.value })}
                                                    required
                                                    placeholder={`Máx: ${espacioLibre.toFixed(1)}`}
                                                />
                                                <span className="suffix">kg/L</span>
                                            </div>
                                            <small className="text-muted" style={{ display: 'block', marginTop: '6px', fontSize: '0.65rem' }}>
                                                Espacio libre disponible: <strong>{espacioLibre.toFixed(1)} kg/L</strong>
                                            </small>
                                        </div>
                                    </div>
                                    <div className="form-group-r">
                                        <label className="checkbox-label">
                                            <input type="checkbox" checked={formData.reportarError} onChange={e => setFormData({ ...formData, reportarError: e.target.checked })} />
                                            <AlertIcon /> Reportar avería en el sensor o contenedor
                                        </label>
                                    </div>
                                    {formData.reportarError && (
                                        <div className="form-group-r animate-slide-up">
                                            <label>Descripción de la avería *</label>
                                            <textarea rows="2" required placeholder="Ej. El sensor de ultrasonido está obstruido..." value={formData.descripcionError} onChange={e => setFormData({ ...formData, descripcionError: e.target.value })}></textarea>
                                        </div>
                                    )}
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary-r full-width" disabled={!formData.pesoAgregado || loading}>
                                            {loading ? 'Transmitiendo...' : 'Actualizar Estado IoT'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-3-wrapper animate-slide-up">
                            <h2 className="text-success-dark">Transmisión IoT Exitosa</h2>
                            <div className="ticket-card">
                                <h3>Log de Sensor</h3>
                                <div className="ticket-row"><span className="label">Contenedor:</span><span className="value">{formData.contenedor?.conCodigo}</span></div>
                                <div className="ticket-row highlight"><span className="label">Peso Añadido:</span><span className="value">+{formData.pesoAgregado} kg/L</span></div>
                                <div className="ticket-row"><span className="label">Timestamp:</span><span className="value">{fechaActualizacion?.toLocaleString()}</span></div>

                                {formData.reportarError && (
                                    <div className="ticket-row alert-box" style={{ marginTop: '6px' }}>
                                        <span className="label text-danger">Avería Reportada:</span>
                                        <span className="value text-danger text-right">{formData.descripcionError}</span>
                                    </div>
                                )}
                            </div>
                            <button className="btn-primary-r" onClick={() => {
                                setStep(1); setFormData({ facultad: null, contenedor: null, pesoAgregado: '', reportarError: false, descripcionError: '' });
                            }}>Simular Otro Sensor</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimuladorSensor;