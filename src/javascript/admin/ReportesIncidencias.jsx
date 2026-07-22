import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import "../../styles/ReporteIncidencias.css";

const ReportesIncidencias = () => {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const res = await api.get('/gamificacion/reportes-errores');
        setReportes(res.data);
      } catch (e) { console.error("Error al cargar reportes", e); }
    };
    fetchReportes();
  }, []);

  const generarDesafio = async (rep) => {
    const desafio = {
      retTitulo: `Reto de Clasificación: ${rep.regContenedor?.conFacultad?.facNombre || 'Facultad'}`,
      retDescripcion: rep.regDescripcionError || 'Se detectó mala clasificación de residuos.',
      retFacultad: rep.regContenedor?.conFacultad,
      retTipoMeta: "CLASIFICACION",
      retMetaKg: 50,
      retFechaInicio: new Date().toISOString().split('T')[0],
      retFechaFin: "2026-12-31",
      retEstado: 'ACTIVO'
    };

    try {
      await api.post('/gamificacion/retos', desafio);
      alert("¡Desafío generado correctamente!");
    } catch (e) {
      console.error(e);
      alert("Error al generar desafío");
    }
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h2>Reportes de Incidencias</h2>
      </div>

      <div className="reportes-table-card">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Facultad</th>
              <th>Contenedor</th>
              <th>Descripción del Error</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map(rep => (
              <tr key={rep.regId}>
                {/* Usamos la estructura de tu modelo RegistroRecoleccion */}
                <td><strong>{rep.regContenedor?.conFacultad?.facNombre || 'N/A'}</strong></td>
                <td>{rep.regContenedor?.conCodigo || 'N/A'}</td>
                <td>{rep.regDescripcionError || 'Sin descripción'}</td>
                <td>
                  <button onClick={() => generarDesafio(rep)} className="btn-generar">
                    Generar Desafío
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesIncidencias;