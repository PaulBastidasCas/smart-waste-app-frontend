import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import '../../styles/Contenedores.css';

const Contenedores = () => {
  const [contenedores, setContenedores] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [tiposResiduo, setTiposResiduo] = useState([]);
  const [loading, setLoading] = useState(true);

  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState({});

  const [formData, setFormData] = useState({
    conCodigo: "", conFacultadId: "", conTipoResiduoId: "", conCapacidadLitros: "",
    conDescripcionUbicacion: "", conEstadoOperativo: "OPERATIVO"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCont, resFac, resTip] = await Promise.all([
          api.get('/contenedores/activos'),
          api.get('/catalogos/facultades'),
          api.get('/catalogos/tipos-residuo')
        ]);

        setContenedores(resCont.data);
        setFacultades(resFac.data);
        setTiposResiduo(resTip.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const facultadSeleccionada = facultades.find(f => (f.facId || f.id) === parseInt(formData.conFacultadId));
      const nombreFacultad = facultadSeleccionada ? (facultadSeleccionada.facNombre || facultadSeleccionada.nombre || facultadSeleccionada.codigo || "").toUpperCase() : "";

      let latAutomatica = 0.35171; 
      let lngAutomatica = -78.12188;

      if (nombreFacultad.includes("FICA")) {
        latAutomatica = 0.35211; lngAutomatica = -78.12351;
      } else if (nombreFacultad.includes("FECYT")) {
        latAutomatica = 0.35182; lngAutomatica = -78.12402;
      } else if (nombreFacultad.includes("FICAYA")) {
        latAutomatica = 0.35253; lngAutomatica = -78.12203;
      } else if (nombreFacultad.includes("FCCSS")) {
        latAutomatica = 0.35124; lngAutomatica = -78.12104;
      } else if (nombreFacultad.includes("FACAE")) {
        latAutomatica = 0.35305; lngAutomatica = -78.12005;
      }

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
      const resCont = await api.get('/contenedores/activos');
      setContenedores(resCont.data);
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
        setContenedores(contenedores.filter(c => c.conId !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el contenedor.");
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
        <p>Registra, edita y supervisa los basureros inteligentes distribuidos en el campus de la UTN.</p>
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
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.3rem' }}>📋 Contenedores por Facultad</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Despliega cada sección para ver el listado.</p>
          </div>

          <div className="contenedor-acordeones">
            {Object.keys(contenedoresAgrupados).length === 0 ? (
              <p style={{color: '#64748b'}}>No hay contenedores registrados en la base de datos.</p>
            ) : (
              Object.keys(contenedoresAgrupados).map((facNombre) => (
                <div className="acordeon-item" key={facNombre}>
                  <div 
                    className="acordeon-header" 
                    onClick={() => toggleAcordeon(facNombre)}
                  >
                    <div className="acordeon-titulo">
                      🏢 {facNombre} 
                      <span className="acordeon-badge">{contenedoresAgrupados[facNombre].length}</span>
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
                        {contenedoresAgrupados[facNombre].map(cont => (
                          <div className="contenedor-card" key={cont.conId} style={{ borderLeftColor: cont.conTipoResiduo?.treColorHex || "#047857" }}>
                            <div className="contenedor-header">
                              <h4 className="contenedor-codigo">🗑️ {cont.conCodigo}</h4>
                              <span className={`badge-estado ${cont.conEstadoOperativo === 'OPERATIVO' ? 'estado-operativo' : 'estado-mantenimiento'}`}>
                                {cont.conEstadoOperativo}
                              </span>
                            </div>
                            
                            <div className="contenedor-info">
                              <span><strong>♻️ Residuo:</strong> {cont.conTipoResiduo?.treNombre || 'N/A'}</span>
                              <span><strong>📦 Capacidad:</strong> {cont.conCapacidadLitros} Litros</span>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cont.conDescripcionUbicacion}</span>
                            </div>

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

                            <div className="contenedor-acciones">
                              <button className="btn-icon edit" style={{flex: 1, padding: '0.5rem', borderRadius:'6px', border:'1px solid #cbd5e1', cursor:'pointer'}} onClick={() => handleEdit(cont)}>✏️ Editar</button>
                              <button className="btn-icon delete" style={{flex: 1, padding: '0.5rem', borderRadius:'6px', border:'1px solid #cbd5e1', cursor:'pointer', color: '#dc2626'}} onClick={() => handleDelete(cont.conId)}>🗑️ Eliminar</button>
                            </div>
                          </div>
                        ))}
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