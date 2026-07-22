import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import '../../styles/Metricas.css';

const Metricas = () => {
  const [kpis, setKpis] = useState({ totalRecolecciones: 0, pesoTotalKg: 0, alertasErrores: 0, promedioLlenado: 0 });
  const [datosSemanales, setDatosSemanales] = useState([]);
  const [datosEstado, setDatosEstado] = useState([]);
  const [datosFacultad, setDatosFacultad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const response = await api.get('/recolecciones/metricas');
        
        setKpis(response.data.kpis);
        setDatosSemanales(response.data.datosSemanales);
        setDatosFacultad(response.data.datosFacultad);

        const colorMap = {
          'CRITICO': '#ef4444', 
          'MEDIO': '#f59e0b',  
          'VACIO': '#10b981'   
        };
        
        const estadosConColor = response.data.datosEstado.map(est => ({
          name: est.name,
          value: est.value,
          color: colorMap[est.name] || '#64748b' 
        }));
        
        setDatosEstado(estadosConColor);

      } catch (error) {
        console.error("Error al cargar las métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
  }, []);

  if (loading) {
    return <div className="metricas-container"><h2>Cargando métricas...</h2></div>;
  }

  return (
    <div className="metricas-container">
      <div className="metricas-header">
        <h2>Panel de Métricas</h2>
        <p>Resumen general de las operaciones de recolección en el campus.</p>
      </div>

      {/* TARJETAS DE RESUMEN (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🗑️</div>
          <div className="kpi-content">
            <h4>Recolecciones Totales</h4>
            <span>{kpis.totalRecolecciones}</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">⚖️</div>
          <div className="kpi-content">
            <h4>Peso Total (Kg)</h4>
            <span>{kpis.pesoTotalKg} kg</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <h4>Errores Clasificación</h4>
            <span>{kpis.alertasErrores} alertas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <h4>Promedio Llenado</h4>
            <span>{kpis.promedioLlenado}%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        
        <div className="chart-card">
          <h3>Kilos Recolectados (Últimos 7 días)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={datosSemanales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} borderRadius={8} />
                <Bar dataKey="peso" fill="#047857" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Estado de Contenedores al Recolectar</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={datosEstado}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Actividad por Facultad (Nº de Recolecciones)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={datosFacultad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="facultad" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} borderRadius={8} />
                <Bar dataKey="recolecciones" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Metricas;