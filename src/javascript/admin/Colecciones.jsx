import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Colecciones.css'; 

const Colecciones = () => {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  let contenedorId = searchParams.get('contenedorId');
  
  useEffect(() => {
    const fetchUltimaRecoleccion = async () => {
      let idAUsar = contenedorId || localStorage.getItem('ultimoContenedorId');
      let endpoint = idAUsar ? `/recolecciones/contenedor/${idAUsar}` : '/recolecciones/ultima';

      if (idAUsar) localStorage.setItem('ultimoContenedorId', idAUsar);

      try {
        const response = await api.get(endpoint);
        const ultimaRec = Array.isArray(response.data) ? response.data[0] : response.data;
        if (ultimaRec) setRec(ultimaRec);
      } catch (error) { 
        console.error("Error cargando recolección:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchUltimaRecoleccion();
  }, [contenedorId]);

  const handleDescargarPDF = () => {
    const contenido = document.querySelector('.printable-area .main-column');
    if (!contenido) return;

    const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML).join('');

    const ventana = window.open('', '_blank', 'width=900,height=1200');
    if (!ventana) return alert('Habilita las ventanas emergentes para descargar el reporte.');

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte de Recolección #${rec?.regContenedor?.conCodigo || 'General'}</title>
          ${estilos}
          <style>
            body { margin: 0; padding: 28px; background: #ffffff; }
            .col-card { box-shadow: none; border: none; padding: 0; margin: 0; }
            .main-column { max-width: 100%; }
          </style>
        </head>
        <body>${contenido.outerHTML}</body>
      </html>
    `);
    ventana.document.close();
    ventana.onload = () => { ventana.focus(); ventana.print(); ventana.close(); };
  };

  const handleEnviarCorreo = async (e) => {
    e.preventDefault();
    if (!rec?.regEncargado?.usuCorreo) {
        return alert("No se encontró el correo del operador asociado a este registro.");
    }

    setEnviando(true);
    try {
      const payload = {
        destino: rec.regEncargado.usuCorreo,
        asunto: asunto,
        mensaje: mensaje,
        nombreAdmin: localStorage.getItem('nombreUsuario') || 'Administrador UTN',
        correoAdmin: localStorage.getItem('correo') || 'admin@utn.edu.ec'
      };

      await api.post('/email/contactar-operador', payload);
      alert("Correo enviado exitosamente al operador.");
      setShowModal(false);
      setAsunto('');
      setMensaje('');
    } catch (error) {
      console.error("Error enviando correo:", error);
      alert("No se pudo enviar el correo.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div style={{padding: '32px'}}>Cargando detalle de recolección...</div>;

  if (!rec) {
    return (
      <div className="colecciones-container">
        <button className="btn-back-map" onClick={() => navigate('/admin/mapa')}>← Volver al mapa</button>
        <div className="empty-state" style={{ marginTop: '4rem' }}>
          <div className="empty-state-icon">🗑️</div>
          <h3>No hay registros</h3>
          <p>Todavía no se ha registrado ninguna recolección {contenedorId ? `para el contenedor #${contenedorId}` : 'en el sistema'}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="colecciones-container printable-area">
      <button className="btn-back-map no-print" onClick={() => navigate('/admin/mapa')}>← Volver al mapa</button>

      <header className="colecciones-top-header">
        <h2>Detalle de Recolección</h2>
        <span className="subtitle">Historial del Contenedor {rec.regContenedor?.conCodigo || 'Seleccionado'}</span>
      </header>

      <div className="colecciones-content-split">
        <div className="main-column">
          <div className="col-card">
            <div className="hero-card">
              <div className="hero-card-left">
                <div className="icon-box">🗑️</div>
                <div>
                  <h3>Recolección de Residuos</h3>
                  <span className="hero-date">📅 {new Date(rec.regFechaHoraRegistro).toLocaleString()}</span>
                </div>
              </div>
              <span className="badge-completado">{rec.regEstadoRegistro || 'COMPLETADO'}</span>
            </div>

            <div className="grid-2-col">
              <div className="info-box">
                <h4>UBICACIÓN DEL CONTENEDOR</h4>
                <p>{rec.regContenedor?.conDescripcionUbicacion || "Ubicación del campus sin descripción"}</p>
              </div>

              <div className="info-box">
                <h4>CAPACIDAD DEL SENSOR</h4>
                <div className="sensor-bar-row">
                  <div className="sensor-bar-label"><span>Antes</span><strong>{rec.regNivelAntesPct || 0}%</strong></div>
                  <div className="sensor-bar-track"><div className="sensor-bar-fill sensor-bar-fill--antes" style={{ width: `${rec.regNivelAntesPct || 0}%` }}></div></div>
                </div>
                <div className="sensor-bar-row">
                  <div className="sensor-bar-label"><span>Después</span><strong>{rec.regNivelDespuesPct || 0}%</strong></div>
                  <div className="sensor-bar-track"><div className="sensor-bar-fill sensor-bar-fill--despues" style={{ width: `${rec.regNivelDespuesPct || 0}%` }}></div></div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <h4>MÉTRICAS DE LA OPERACIÓN</h4>
              <div className="metrics-row">
                <div className="metric"><span className="metric-icon">⚖️</span><strong>{rec.regPesoEstimadoKg || 0} kg</strong><span className="metric-label">Peso</span></div>
                <div className="metric"><span className="metric-icon">⚠️</span><strong>{rec.regTieneClasificacionErronea ? "SÍ" : "NO"}</strong><span className="metric-label">Error Clasif.</span></div>
                <div className="metric"><span className="metric-icon">📦</span><strong>{rec.regEstadoLLenado || 'N/A'}</strong><span className="metric-label">Estado Final</span></div>
                <div className="metric"><span className="metric-icon">💧</span><strong>{rec.regVolumenEstimado || "--"} L</strong><span className="metric-label">Volumen</span></div>
              </div>
              {rec.regTieneClasificacionErronea && rec.regDescripcionError && (
                <div className="alert-box" style={{marginTop: '15px', padding: '10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px'}}>
                  <h4 style={{color: '#dc2626', marginBottom: '4px'}}>DESCRIPCIÓN DEL ERROR</h4>
                  <p style={{margin: 0, fontSize: '0.85rem', color: '#991b1b'}}>{rec.regDescripcionError}</p>
                </div>
              )}
            </div>

            <div className="observaciones-section">
              <h4>OBSERVACIONES DEL OPERADOR</h4>
              <div className="observaciones-box">{rec.regObservaciones || "Sin observaciones adicionales."}</div>
            </div>
          </div>
        </div>

        <div className="side-column no-print">
          <div className="side-card">
            <h4>PERSONAL RESPONSABLE</h4>
            <div className="operador-row">
              <div className="operador-avatar">👤</div>
              <p>{rec.regEncargado ? `${rec.regEncargado.usuNombre} ${rec.regEncargado.usuApellido}` : "Cargando..."}</p>
            </div>
            <button className="btn-action" onClick={() => setShowModal(true)}>✉️ Contactar Operador</button>
          </div>

          <div className="side-card">
            <h4>HISTORIAL DEL EVENTO</h4>
            <div className="timeline">
              <div className="timeline-item"><div className="timeline-dot timeline-dot--filled"></div><div className="timeline-content"><h5>Completado</h5><span>Sistema Auditable</span></div></div>
              <div className="timeline-item"><div className="timeline-dot"></div><div className="timeline-content"><h5>Registrado</h5><span>Inmutable</span></div></div>
            </div>
          </div>

          <div className="side-card">
            <h4>ACCIONES DEL REGISTRO</h4>
            <button className="btn-action btn-pdf" onClick={handleDescargarPDF}>📄 Descargar Reporte PDF</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <h3>Contactar a {rec?.regEncargado?.usuNombre}</h3>
            <p>Se enviará un correo con copia a tu dirección ({localStorage.getItem('correo')}).</p>
            <form onSubmit={handleEnviarCorreo}>
              <div className="form-group-custom">
                <label>Asunto</label>
                <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} required placeholder="Ej: Consulta sobre recolección en FACAE" />
              </div>
              <div className="form-group-custom">
                <label>Mensaje</label>
                <textarea rows="4" value={mensaje} onChange={(e) => setMensaje(e.target.value)} required placeholder="Escribe tu mensaje aquí..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar Correo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colecciones;