import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Contenedores.css';

const Contenedores = () => {
  const [contenedores, setContenedores] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [tiposResiduo, setTiposResiduo] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({});

  const [formData, setFormData] = useState({
    conCodigo: "", conFacultadId: "", conTipoResiduoId: "", conCapacidadLitros: "",
    conDescripcionUbicacion: "", conEstadoOperativo: "OPERATIVO"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const obtenerColorHex = (cont) => {
    const hex = cont?.conTipoResiduo?.treColorHex;
    if (hex) return hex;
    const n = cont?.conTipoResiduo?.treNombre?.toLowerCase() || '';
    if (n.includes('reciclable') && !n.includes('no')) return '#2563eb';
    if (n.includes('orgánico') || n.includes('organico')) return '#16a34a';
    if (n.includes('no reciclable')) return '#1f2937';
    return '#64748b';
  };

  const ResiduoBadgeSVG = ({ nombre, colorHex }) => {
    const n = nombre ? nombre.toLowerCase() : '';
    const color = colorHex || '#64748b';
    const badgeStyle = { backgroundColor: color, color: '#ffffff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' };

    if (n.includes('reciclable') && !n.includes('no')) {
      return (
        <span style={badgeStyle}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 19 3 15 7 11"></polyline><path d="M21 13a7 7 0 0 0-7-7H3"></path><polyline points="17 5 21 9 17 13"></polyline><path d="M3 11a7 7 0 0 0 7 7h11"></path>
          </svg>
          {nombre}
        </span>
      );
    }
    if (n.includes('orgánico') || n.includes('organico')) {
      return (
        <span style={badgeStyle}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-5 11-10 11z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
          {nombre}
        </span>
      );
    }
    return (
      <span style={badgeStyle}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
        {nombre || "No Reciclable"}
      </span>
    );
  };

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [resFac, resTip] = await Promise.all([
          api.get('/catalogos/facultades'),
          api.get('/catalogos/tipos-residuo')
        ]);
        setFacultades(resFac.data);
        setTiposResiduo(resTip.data);
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, []);

  const cargarContenedores = async () => {
    try {
      const endpoint = mostrarInactivos ? '/contenedores/inactivos' : '/contenedores/activos';
      const resCont = await api.get(endpoint);
      setContenedores(resCont.data);
    } catch (error) {
      console.error("Error al cargar contenedores:", error);
    }
  };

  useEffect(() => {
    cargarContenedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarInactivos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const facultadSeleccionada = facultades.find(f => (f.facId || f.id) === parseInt(formData.conFacultadId));
      
      const latAutomatica = parseFloat(facultadSeleccionada?.facLatitud || facultadSeleccionada?.latitud || 0.36075);
      const lngAutomatica = parseFloat(facultadSeleccionada?.facLongitud || facultadSeleccionada?.longitud || -78.11502);

      const payload = {
        conCodigo: formData.conCodigo,
        conCapacidadLitros: parseFloat(formData.conCapacidadLitros),
        conDescripcionUbicacion: formData.conDescripcionUbicacion,
        conEstadoOperativo: formData.conEstadoOperativo,
        conLatitud: latAutomatica,   
        conLongitud: lngAutomatica,   
        conFacultad: { facId: parseInt(formData.conFacultadId) },
        conTipoResiduo: { treId: parseInt(formData.conTipoResiduoId) }
      };

      if (isEditing) {
        await api.put(`/contenedores/${editId}`, payload);
        alert("Contenedor actualizado exitosamente.");
      } else {
        await api.post('/contenedores', payload);
        alert("Nuevo contenedor registrado en el campus.");
      }

      limpiarFormulario();
      cargarContenedores();
    } catch (error) {
      console.error("Error al guardar contenedor:", error);
      alert("Error al guardar. Verifica la consola.");
    }
  };

  const handleEdit = (cont) => {
    setFormData({
      conCodigo: cont.conCodigo || "",
      conFacultadId: cont.conFacultad?.facId || cont.conFacultad?.id || "",
      conTipoResiduoId: cont.conTipoResiduo?.treId || "",
      conCapacidadLitros: cont.conCapacidadLitros || "",
      conDescripcionUbicacion: cont.conDescripcionUbicacion || "",
      conEstadoOperativo: cont.conEstadoOperativo || "OPERATIVO"
    });
    setIsEditing(true);
    setEditId(cont.conId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este contenedor de la red?")) {
      try {
        await api.delete(`/contenedores/${id}`);
        cargarContenedores();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el contenedor.");
      }
    }
  };

  const handleReactivar = async (id) => {
    if (window.confirm("¿Deseas reactivar este contenedor y resetear sus valores?")) {
      try {
        await api.patch(`/contenedores/${id}/reactivar`);
        cargarContenedores();
      } catch (error) {
        console.error("Error al reactivar:", error);
        alert("Error al reactivar el contenedor.");
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      conCodigo: "", conFacultadId: "", conTipoResiduoId: "", conCapacidadLitros: "",
      conDescripcionUbicacion: "", conEstadoOperativo: "OPERATIVO"
    });
    setIsEditing(false);
    setEditId(null);
  };

  const getColorLlenado = (porcentaje) => {
    if (porcentaje < 50) return "#10b981";
    if (porcentaje < 80) return "#f59e0b";
    return "#ef4444";
  };

  const toggleAcordeon = (facultadNombre) => {
    setAcordeonesAbiertos(prev => ({
      ...prev,
      [facultadNombre]: !prev[facultadNombre]
    }));
  };

  const contenedoresAgrupados = contenedores.reduce((acc, cont) => {
    const facNombre = cont.conFacultad?.facCodigo || cont.conFacultad?.codigo || cont.conFacultad?.nombre || 'Sin Asignar';
    if (!acc[facNombre]) {
      acc[facNombre] = [];
    }
    acc[facNombre].push(cont);
    return acc;
  }, {});

  if (loading) return <div className="contenedores-container"><h3>Cargando sistema de contenedores...</h3></div>;

  return (
    <div className="contenedores-container">
      <div className="contenedores-header">
        <h2>Gestión de Contenedores</h2>
        <p>Registra, edita y supervisa los basureros distribuidos en el campus de la UTN.</p>
      </div>

      <div className="contenedores-split">
        <div className="creador-column">
          <div className="form-card">
            <h3>{isEditing ? "✏️ Editar Contenedor" : "Nuevo Contenedor"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Código Único</label>
                  <input type="text" className="form-control" name="conCodigo" placeholder="Ej: FICA-01" value={formData.conCodigo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Facultad Asignada</label>
                  <select className="form-control" name="conFacultadId" value={formData.conFacultadId} onChange={handleChange} required>
                    <option value="">Seleccione...</option>
                    {facultades.map(f => (
                      <option key={f.facId || f.id} value={f.facId || f.id}>
                        {f.facCodigo || f.codigo || f.facNombre || f.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Residuo</label>
                  <select className="form-control" name="conTipoResiduoId" value={formData.conTipoResiduoId} onChange={handleChange} required>
                    <option value="">Seleccione...</option>
                    {tiposResiduo.map(tr => (
                      <option key={tr.treId} value={tr.treId}>{tr.treNombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacidad (Litros)</label>
                  <input type="number" step="any" className="form-control" name="conCapacidadLitros" placeholder="Ej: 120" value={formData.conCapacidadLitros} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción de la Ubicación</label>
                <textarea className="form-control" name="conDescripcionUbicacion" placeholder="Ej: Contenedor piso 1, entrada principal..." rows="2" value={formData.conDescripcionUbicacion} onChange={handleChange} required />
              </div>

              {isEditing && (
                <div className="form-group">
                  <label>Estado Operativo</label>
                  <select className="form-control" name="conEstadoOperativo" value={formData.conEstadoOperativo} onChange={handleChange}>
                    <option value="OPERATIVO">Operativo (En uso)</option>
                    <option value="REQUIERE_MANTENIMIENTO">Mantenimiento </option>
                    <option value="FUERA_DE_SERVICIO"> Dañado </option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-submit">
                {isEditing ? "💾 Guardar Cambios" : "Registrar Contenedor"}
              </button>

              {isEditing && (
                <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>Cancelar</button>
              )}
            </form>
          </div>
        </div>

        <div className="inventario-column">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.3rem' }}>
                {mostrarInactivos ? '🚫 Contenedores Inactivos' : '📋 Contenedores por Facultad'}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                {mostrarInactivos ? 'Historial de contenedores retirados.' : 'Despliega cada sección para ver el listado.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMostrarInactivos(!mostrarInactivos);
                limpiarFormulario();
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: mostrarInactivos ? '#f1f5f9' : '#e0e7ff',
                color: mostrarInactivos ? '#475569' : '#4338ca',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {mostrarInactivos ? 'Ver Activos' : 'Ver Inactivos'}
            </button>
          </div>

          <div className="contenedor-acordeones">
            {Object.keys(contenedoresAgrupados).length === 0 ? (
              <p style={{ color: '#64748b' }}>No hay contenedores {mostrarInactivos ? 'inactivos' : 'activos'} registrados en la base de datos.</p>
            ) : (
              Object.keys(contenedoresAgrupados).map((facNombre) => (
                <div className="acordeon-item" key={facNombre}>
                  <div
                    className="acordeon-header"
                    onClick={() => toggleAcordeon(facNombre)}
                  >
                    <div className="acordeon-titulo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
                      </svg>
                      {facNombre}
                      <span className="acordeon-badge" style={{ backgroundColor: mostrarInactivos ? '#ef4444' : '#e2e8f0', color: mostrarInactivos ? 'white' : 'inherit' }}>
                        {contenedoresAgrupados[facNombre].length}
                      </span>
                    </div>
                    <svg
                      className={`acordeon-icono ${acordeonesAbiertos[facNombre] ? 'abierto' : ''}`}
                      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {acordeonesAbiertos[facNombre] && (
                    <div className="acordeon-contenido">
                      <div className="lista-contenedores" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {contenedoresAgrupados[facNombre].map(cont => {
                          const colorHex = obtenerColorHex(cont);
                          const tipoResiduoNombre = cont.conTipoResiduo?.treNombre || 'Sin clasificar';

                          return (
                            <div className="contenedor-card" key={cont.conId} style={{ borderLeftColor: colorHex, opacity: mostrarInactivos ? 0.8 : 1 }}>
                              <div className="contenedor-header">
                                <h4 className="contenedor-codigo">{cont.conCodigo}</h4>
                                <span className={`badge-estado ${cont.conEstadoOperativo === 'OPERATIVO' ? 'estado-operativo' : 'estado-mantenimiento'}`}>
                                  {mostrarInactivos ? 'INACTIVO' : cont.conEstadoOperativo}
                                </span>
                              </div>

                              <div className="contenedor-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  <ResiduoBadgeSVG nombre={tipoResiduoNombre} colorHex={colorHex} />
                                </div>
                                <span><strong>📦 Capacidad:</strong> {cont.conCapacidadLitros} Litros</span>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  {cont.conDescripcionUbicacion}
                                </span>
                              </div>

                              {!mostrarInactivos && (
                                <div className="nivel-llenado">
                                  <div className="nivel-label">
                                    <span>Sensor ({cont.conEstadoLlenado || 'VACIO'})</span>
                                    <span>{cont.conNivelLlenadoPct || 0}%</span>
                                  </div>
                                  <div className="nivel-track">
                                    <div
                                      className="nivel-fill"
                                      style={{
                                        width: `${cont.conNivelLlenadoPct || 0}%`,
                                        backgroundColor: getColorLlenado(cont.conNivelLlenadoPct || 0)
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="contenedor-acciones" style={{ marginTop: mostrarInactivos ? '15px' : '0' }}>
                                {mostrarInactivos ? (
                                  <button className="btn-icon success" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #10b981', cursor: 'pointer', color: '#10b981', backgroundColor: '#ecfdf5', fontWeight: 'bold' }} onClick={() => handleReactivar(cont.conId)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                      <polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                    </svg>
                                    Reactivar
                                  </button>
                                ) : (
                                  <>
                                    <button className="btn-icon edit" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }} onClick={() => handleEdit(cont)}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                      Editar
                                    </button>
                                    <button className="btn-icon delete" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', color: '#dc2626' }} onClick={() => handleDelete(cont.conId)}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                      Eliminar
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contenedores;