import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapaCampus.css';

// Centro del campus UTN (Ibarra, Ecuador)
const UTN_CENTER = [0.3508, -78.1214];

const MapaCampus = () => {
  const navigate = useNavigate();
  const [contenedores, setContenedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContenedores = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const response = await axios.get('http://localhost:8080/api/contenedores/activos', config);
        setContenedores(response.data);
      } catch (error) {
        console.error("Error al cargar contenedores en el mapa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContenedores();
  }, [navigate]);

  const crearIconoMarcador = (nivelPct) => {
    let colorClass = 'marker-green';
    if (nivelPct > 50 && nivelPct <= 80) colorClass = 'marker-yellow';
    if (nivelPct > 80) colorClass = 'marker-red';

    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div class="map-marker ${colorClass}">
               <div class="marker-percentage">${nivelPct}%</div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  return (
    <div className="mapa-container fade-in">
      <div className="mapa-header">
        <h2>Mapa del Campus - UTN</h2>
        <p>Vista general de contenedores de residuos y su estado en tiempo real.</p>
        
        <div className="mapa-leyenda">
          <span className="leyenda-item"><span className="dot dot-green"></span> Operativo (&lt; 50%)</span>
          <span className="leyenda-item"><span className="dot dot-yellow"></span> Nivel Medio (50% - 80%)</span>
          <span className="leyenda-item"><span className="dot dot-red"></span> Crítico (&gt; 80%)</span>
        </div>
      </div>

      <div className="mapa-wrapper">
        {loading ? (
          <div className="loading-map">Cargando datos del campus...</div>
        ) : (
          <MapContainer 
            center={UTN_CENTER} 
            zoom={17} 
            scrollWheelZoom={true} 
            className="leaflet-map-container"
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {contenedores.map(cont => {
              if (!cont.conLatitud || !cont.conLongitud) return null;

              const position = [cont.conLatitud, cont.conLongitud];
              const nivel = cont.conNivelLlenadoPct || 0;

              return (
                <Marker 
                  key={cont.conId} 
                  position={position} 
                  icon={crearIconoMarcador(nivel)}
                >
                  <Popup className="custom-popup">
                    <div className="popup-content">
                      <div className="popup-header">
                        <strong>{cont.conCodigo}</strong>
                        <span className={`status-badge ${nivel > 80 ? 'lleno' : 'operativo'}`}>
                          {nivel}%
                        </span>
                      </div>
                      
                      <div className="popup-body">
                        <p><strong>Facultad:</strong> {cont.conFacultad?.facCodigo || cont.conFacultad?.facNombre || "UTN"}</p>
                        <p><strong>Ubicación:</strong> {cont.conDescripcionUbicacion}</p>
                        <p>
                          <strong>Residuo:</strong>{' '}
                          <span className="badge-residuo">
                            🗑️ {cont.conTipoResiduo?.treNombre || "Sin clasificar"}
                          </span>
                        </p>
                      </div>

                      <div className="popup-footer">
                        <div className="progress-bar mt-2">
                          <div 
                            className={`progress-fill ${nivel > 80 ? 'danger' : 'success'}`} 
                            style={{width: `${nivel}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapaCampus;