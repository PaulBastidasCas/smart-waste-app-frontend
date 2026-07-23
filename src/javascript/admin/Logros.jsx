import React, { useState, useEffect } from 'react';
import api from "../../services/api"
import '../../styles/Logros.css';

const Logros = () => {
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    insNombre: "", 
    insDescripcion: "", 
    insCriterioValor: "", 
    insCriterioTipo: "KG_TOTAL", 
    insIconoBase64: "🏆",
    insColorHex: "#2ECC71"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchInsignias();
  }, []);

  const fetchInsignias = async () => {
    try {

      const response = await api.get('/insignias');
      const activas = response.data.filter(ins => ins.insActiva !== false);
      setLogros(activas);
    } catch (error) {
      console.error("Error al cargar EcoTokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      if (isEditing) {
        await api.put(`/insignias/${editId}`, formData);
        alert("EcoToken actualizado exitosamente.");
      } else {
        await api.post('/insignias', formData);
        alert("Nuevo EcoToken creado y publicado.");
      }
      
      limpiarFormulario();
      fetchInsignias(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar. Revisa la consola.");
    }
  };

  const handleEdit = (logro) => {
    setFormData({
      insNombre: logro.insNombre,
      insDescripcion: logro.insDescripcion,
      insCriterioValor: logro.insCriterioValor,
      insCriterioTipo: logro.insCriterioTipo,
      insIconoBase64: logro.insIconoBase64 || "🏆",
      insColorHex: logro.insColorHex || "#2ECC71"
    });
    setIsEditing(true);
    setEditId(logro.insId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de desactivar este EcoToken?")) {
      try {
        await api.delete(`/insignias/${id}`);
        fetchInsignias(); 
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };
  
  const limpiarFormulario = () => {
    setFormData({ 
      insNombre: "", 
      insDescripcion: "", 
      insCriterioValor: "", 
      insCriterioTipo: "KG_TOTAL", 
      insIconoBase64: "🏆", 
      insColorHex: "#2ECC71" 
    });
    setIsEditing(false);
    setEditId(null);
  };

  if (loading) return <div className="logros-container">Cargando EcoTokens...</div>;

  return (
    <div className="logros-container">
      <div className="logros-header">
        <h2>Gestión de EcoTokens UTN (Logros)</h2>
        <p>Crea misiones y retos para motivar a los estudiantes a reciclar en el campus.</p>
      </div>

      <div className="logros-content-split">
        <div className="creador-column">
          <div className="creador-card">
            <h3>{isEditing ? "✏️ Editar EcoToken" : "Crear Nuevo EcoToken UTN"}</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.2rem'}}>
                <div style={{flex: 1}}>
                  <label className="form-group label" style={{display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem'}}>Icono</label>
                  <select className="form-control" name="insIconoBase64" value={formData.insIconoBase64} onChange={handleChange}>
                    <option value="🏆">🏆 Trofeo</option>
                    <option value="🌱">🌱 Planta</option>
                    <option value="♻️">♻️ Reciclaje</option>
                    <option value="🛡️">🛡️ Escudo</option>
                    <option value="⭐">⭐ Estrella</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label className="form-group label" style={{display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem'}}>Color (Fondo)</label>
                  <input type="color" className="form-control" name="insColorHex" value={formData.insColorHex} onChange={handleChange} style={{padding: '0.2rem', height: '42px'}} />
                </div>
              </div>

              <div className="form-group">
                <label>Título del EcoToken</label>
                <input type="text" className="form-control" name="insNombre" placeholder="Ej: Reciclador Experto" value={formData.insNombre} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea className="form-control" name="insDescripcion" placeholder="¿Qué tiene que hacer el estudiante para ganarla?" rows="3" value={formData.insDescripcion} onChange={handleChange} required />
              </div>

              <div style={{display: 'flex', gap: '1rem', marginBottom: '1.2rem'}}>
                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Meta Numérica</label>
                  <input type="number" step="0.01" className="form-control" name="insCriterioValor" placeholder="Ej: 50" value={formData.insCriterioValor} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Criterio (Enum)</label>
                  <select className="form-control" name="insCriterioTipo" value={formData.insCriterioTipo} onChange={handleChange}>
                    <option value="KG_TOTAL">Total Kilos</option>
                    <option value="RECOLECCIONES_MES">Recolecciones/Mes</option>
                    <option value="TASA_CLASIFICACION">Tasa de Clasificación</option>
                    <option value="META_ALCANZADA">Meta Alcanzada</option>
                    <option value="RANKING_MES">Ranking del Mes</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-submit">
                {isEditing ? "💾 Guardar Cambios" : "Publicar EcoToken"}
              </button>
              
              {isEditing && (
                <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="inventario-column">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.3rem' }}>
              📋 EcoTokens Publicados
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
              Retos activos guardados en la base de datos de la UTN.
            </p>
          </div>

          <div className="inventario-grid">
            {logros.length === 0 ? (
              <p style={{color: '#64748b'}}>No hay ecoTokens activos. ¡Crea el primero!</p>
            ) : (
              logros.map(logro => (
                <div className="logro-card" key={logro.insId} style={{ borderTop: `4px solid ${logro.insColorHex || '#2ECC71'}` }}>
                  <div className="logro-header">
                    <div className="logro-icon" style={{ backgroundColor: `${logro.insColorHex}20` }}>{logro.insIconoBase64 || "🏆"}</div>
                    <span className="badge-xp">Meta: {logro.insCriterioValor}</span>
                  </div>
                  
                  <h4>{logro.insNombre}</h4>
                  <p>{logro.insDescripcion}</p>
                  
                  <div className="logro-meta">
                    <strong>Criterio:</strong> {logro.insCriterioTipo.replace(/_/g, " ")}
                  </div>

                  <div className="logro-acciones">
                    <button className="btn-icon edit" onClick={() => handleEdit(logro)}>✏️ Editar</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(logro.insId)}>🗑️ Desactivar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logros;