import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapaCampus.css';

const UTN_CENTER = [0.357753, -78.111410];

const MapaCampus = () => {
  const navigate = useNavigate();
  const [contenedores, setContenedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(null);
  
  const [posicionUsuario, setPosicionUsuario] = useState(null);

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

  const facultadesAgrupadas = useMemo(() => {
    const agrupado = contenedores.reduce((acc, cont) => {
      const fac = cont.conFacultad;
      if (!fac || !cont.conLatitud || !cont.conLongitud) return acc;
      
      const facId = fac.facId || fac.id;
      const nivel = cont.conNivelLlenadoPct || 0;

      if (!acc[facId]) {
        acc[facId] = {
          id: facId,
          codigo: fac.facCodigo || fac.codigo,
          nombre: fac.facNombre || fac.nombre,
          latitud: cont.conLatitud, 
          longitud: cont.conLongitud,
          contenedores: [],
          nivelMaximo: 0 
        };
      }

      acc[facId].contenedores.push(cont);
      
      if (nivel > acc[facId].nivelMaximo) {
        acc[facId].nivelMaximo = nivel;
      }

      return acc;
    }, {});

    return Object.values(agrupado);
  }, [contenedores]);

  const crearIconoFacultad = (nivelMax, codigoFacultad) => {
    let colorClass = 'marker-green';
    if (nivelMax > 50 && nivelMax <= 80) colorClass = 'marker-yellow';
    if (nivelMax > 80) colorClass = 'marker-red';

    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div class="map-marker-facultad ${colorClass}">
               <div class="marker-text">${codigoFacultad}</div>
             </div>`,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });
  };

  const iconoUsuario = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="user-location-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const calcularLlenadoActual = (capacidad, porcentaje) => {
    if(!capacidad || !porcentaje) return 0;
    return ((capacidad * porcentaje) / 100).toFixed(1);
  };

  const calcularKg = (litros, factor) => {
    const factorNum = parseFloat(factor) || 1;
    return (parseFloat(litros) * factorNum).toFixed(1);
  };

  const ControlUbicacion = () => {
    const map = useMap();

    useEffect(() => {
      map.on('locationfound', (e) => {
        setPosicionUsuario(e.latlng);
        map.flyTo(e.latlng, 19);
      });
      map.on('locationerror', (e) => {
        alert("No se pudo obtener tu ubicación. Verifica los permisos del navegador.");
      });
    }, [map]);

    return (
      <button 
        className="btn-mi-ubicacion"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.locate();
        }}
        title="Centrar en mi ubicación"
      >
        📍
      </button>
    );
  };

  return (
    <div className="mapa-container fade-in">
      
      <div className="mapa-header-card">
        <div className="header-titles">
          <h2>🗺️ Mapa del Campus - UTN</h2>
          <p>Selecciona una facultad para ver el detalle de sus contenedores en tiempo real.</p>
        </div>
        
        <div className="mapa-leyenda-moderna">
          <div className="leyenda-pill verde">
            <span className="dot dot-green"></span>
            <span>Óptimo (&lt; 50%)</span>
          </div>
          <div className="leyenda-pill amarillo">
            <span className="dot dot-yellow"></span>
            <span>Atención (50% - 80%)</span>
          </div>
          <div className="leyenda-pill rojo">
            <span className="dot dot-red"></span>
            <span>Crítico (&gt; 80%)</span>
          </div>
        </div>
      </div>

      <div className="mapa-layout-split">
        <div className={`mapa-seccion ${facultadSeleccionada ? 'mapa-reducido' : 'mapa-completo'}`}>
          {loading ? (
            <div className="loading-map">Cargando datos del campus...</div>
          ) : (
            <MapContainer 
              center={UTN_CENTER} 
              zoom={19} 
              scrollWheelZoom={true} 
              className="leaflet-map-container"
              style={{ height: '600px', width: '100%', borderRadius: '12px', position: 'relative' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ControlUbicacion />

              {/* Dibuja la ubicación del usuario si existe */}
              {posicionUsuario && (
                <Marker position={posicionUsuario} icon={iconoUsuario}>
                  <Popup>Estás aquí</Popup>
                </Marker>
              )}

              {facultadesAgrupadas.map(fac => (
                <Marker 
                  key={fac.id} 
                  position={[fac.latitud, fac.longitud]} 
                  icon={crearIconoFacultad(fac.nivelMaximo, fac.codigo)}
                  eventHandlers={{
                    click: () => {
                      setFacultadSeleccionada(fac);
                    },
                  }}
                >
                  <Popup className="custom-popup">
                    <div style={{textAlign: 'center', fontWeight: 'bold'}}>
                      {fac.nombre}
                      <br/>
                      <span style={{fontSize: '0.8rem', color: '#666'}}>{fac.contenedores.length} contenedores</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {facultadSeleccionada && (
          <div className="panel-detalle-facultad animate-slide-left">
            <div className="panel-header">
              <div className="header-info">
                <h3>{facultadSeleccionada.codigo}</h3>
                <p>{facultadSeleccionada.nombre}</p>
              </div>
              <button className="btn-close-panel" onClick={() => setFacultadSeleccionada(null)}>✕</button>
            </div>

            <div className="panel-estadisticas">
              <div className="stat-box">
                <span className="stat-num">{facultadSeleccionada.contenedores.length}</span>
                <span className="stat-label">Contenedores</span>
              </div>
              <div className="stat-box">
                <span className={`stat-num ${facultadSeleccionada.nivelMaximo > 80 ? 'text-danger' : 'text-success'}`}>
                  {facultadSeleccionada.nivelMaximo}%
                </span>
                <span className="stat-label">Máx. Llenado</span>
              </div>
            </div>

            <div className="lista-contenedores-panel">
              {facultadSeleccionada.contenedores.map(cont => {
                const nivel = cont.conNivelLlenadoPct || 0;
                const capacidadL = cont.conCapacidadLitros || 0;
                const factorKg = cont.conTipoResiduo?.treFactorKgUnidad || 1;
                
                const llenoL = calcularLlenadoActual(capacidadL, nivel);
                const capacidadKg = calcularKg(capacidadL, factorKg);
                const llenoKg = calcularKg(llenoL, factorKg);

                return (
                  <div key={cont.conId || cont.id} className="mini-contenedor-card">
                    <div className="mini-card-top">
                      <strong>{cont.conCodigo || cont.codigo}</strong>
                      <span className={`status-badge ${nivel > 80 ? 'lleno' : 'operativo'}`}>
                        {nivel}%
                      </span>
                    </div>
                    <div className="mini-card-body">
                      <p className="ubicacion-txt">📍 {cont.conDescripcionUbicacion}</p>
                      <span className="badge-residuo-small">
                        🗑️ {cont.conTipoResiduo?.treNombre || "Sin clasificar"}
                      </span>
                    </div>
                    <div className="progress-bar mt-2" style={{ height: '6px' }}>
                      <div 
                        className={`progress-fill ${nivel > 80 ? 'danger' : 'success'}`} 
                        style={{width: `${nivel}%`}}
                      ></div>
                    </div>
                    <div className="mini-card-footer">
                      <small>
                        Lleno: {llenoL} L <span style={{fontWeight: '600', color: '#6c757d'}}>({llenoKg} kg)</span> / {capacidadL} L <span style={{color: '#6c757d'}}>({capacidadKg} kg)</span>
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapaCampus;