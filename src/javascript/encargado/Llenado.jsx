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

    const obtenerColorHex = (cont) => {
        const hex = cont?.conTipoResiduo?.treColorHex;
        if (hex) return hex;
        const n = cont?.conTipoResiduo?.treNombre?.toLowerCase() || '';
        if (n.includes('reciclable') && !n.includes('no')) return '#2563eb';
        if (n.includes('orgánico') || n.includes('organico')) return '#16a34a';
        if (n.includes('no reciclable')) return '#1f2937';
        return '#64748b';
    };

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
            setContenedores(response.data.filter(c => c.conActivo === true));
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
            alert(error.response?.data?.mensaje || "Error al registrar el peso.");
        } finally {
            setLoading(false);
        }
    };

    const BuildingIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M14 10h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
        </svg>
    );

    const FillingBinIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="13" x2="9" y2="17"></line>
            <line x1="15" y1="15" x2="15" y2="17"></line>
        </svg>
    );

    const ResiduoBadgeSVG = ({ nombre, colorHex }) => {
        const n = nombre ? nombre.toLowerCase() : '';
        const color = colorHex || '#64748b';

        if (n.includes('reciclable') && !n.includes('no')) {
            return (
                <span style={{ backgroundColor: color, color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', margin: '4px 0 8px 0' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="7 19 3 15 7 11"></polyline>
                        <path d="M21 13a7 7 0 0 0-7-7H3"></path>
                        <polyline points="17 5 21 9 17 13"></polyline>
                        <path d="M3 11a7 7 0 0 0 7 7h11"></path>
                    </svg>
                    {nombre}
                </span>
            );
        }

        if (n.includes('orgánico') || n.includes('organico')) {
            return (
                <span style={{ backgroundColor: color, color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', margin: '4px 0 8px 0' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-5 11-10 11z"></path>
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                    </svg>
                    {nombre}
                </span>
            );
        }

        return (
            <span style={{ backgroundColor: color, color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', margin: '4px 0 8px 0' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                {nombre || "No Reciclable"}
            </span>
        );
    };

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
                    <div className={`step ${step >= 3 ? 'active' : ''}`}><div className={`step-circle ${step >= 3 ? 'glow' : ''}`}>3</div><span>Gestión Completa</span></div>
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
                                <h3>Paso 2 — Gestionar el Peso del Contenedor</h3>
                            </div>

                            {loading ? <p className="text-center">Cargando contenedores...</p> : contenedores.length === 0 ? (
                                <div className="empty-state">No hay contenedores registrados.</div>
                            ) : (
                                <div className="contenedores-grid">
                                    {contenedores.map(cont => {
                                        const nivelPct = cont.conNivelLlenadoPct || 0;
                                        const estadoLlenado = cont.conEstadoLlenado || 'VACIO';
                                        const isLleno = nivelPct >= 100 || estadoLlenado === 'CRITICO';
                                        const colorHex = obtenerColorHex(cont);
                                        const tipoResiduoNombre = cont.conTipoResiduo?.treNombre || cont.tipoResiduo?.nombre;

                                        return (
                                            <div key={cont.conId || cont.id} 
                                                 className={`contenedor-card ${(formData.contenedor?.conId || formData.contenedor?.id) === (cont.conId || cont.id) ? 'selected' : ''} ${isLleno ? 'disabled-card' : ''}`}
                                                 onClick={() => { if (!isLleno) setFormData({ ...formData, contenedor: cont }); }}
                                                 style={{ borderTop: `4px solid ${colorHex}` }}>
                                                <div className="card-top">
                                                    <span className={`status-badge ${(cont.conEstadoOperativo) === 'OPERATIVO' ? 'operativo' : 'mantenimiento'}`}>{cont.conEstadoOperativo || 'OPERATIVO'}</span>
                                                    <span className={`status-badge llenado-${estadoLlenado.toLowerCase()}`}>{estadoLlenado}</span>
                                                </div>
                                                <div className="card-center">
                                                    <div className="icon-wrapper" style={{ color: colorHex }}>
                                                        <FillingBinIcon />
                                                    </div>
                                                    <h4>{cont.conCodigo}</h4>
                                                    <ResiduoBadgeSVG nombre={tipoResiduoNombre} colorHex={colorHex} />
                                                    <p>{isLleno ? 'Contenedor Lleno (Bloqueado)' : 'Contenedor Activo'}</p>
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
                                    <h3 className="form-title"><FillingBinIcon /> Gestionar Peso</h3>
                                    <div className="form-row-custom">
                                        <div className="form-group-r half">
                                            <label>Peso (kg/L) *</label>
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
                                            <AlertIcon /> REPORTE DE INCIDENTES
                                        </label>
                                    </div>
                                    {formData.reportarError && (
                                        <div className="form-group-r animate-slide-up">
                                            <label>Descripción de la avería *</label>
                                            <textarea rows="2" required placeholder="Ej. El contenedor está obstruido..." value={formData.descripcionError} onChange={e => setFormData({ ...formData, descripcionError: e.target.value })}></textarea>
                                        </div>
                                    )}
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary-r full-width" disabled={!formData.pesoAgregado || loading}>
                                            {loading ? 'Transmitiendo...' : 'Gestionar'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-3-wrapper animate-slide-up">
                            <h2 className="text-success-dark">Gestión Exitosa</h2>
                            <div className="ticket-card">
                                <h3>Log de la Gestión</h3>
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
                            }}>Gestionar otro Contenedor</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimuladorSensor;