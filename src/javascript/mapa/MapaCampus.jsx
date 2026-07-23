import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
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
      try {
        setLoading(true);
        const response = await api.get('contenedores/activos');
        setContenedores(response.data);
      } catch (error) {
        console.error("Error al cargar contenedores en el mapa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContenedores();
  }, []);

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
          sumaNiveles: 0,
          nivelPromedio: 0
        };
      }

      acc[facId].contenedores.push(cont);
      acc[facId].sumaNiveles += nivel;

      acc[facId].nivelPromedio = Math.round(acc[facId].sumaNiveles / acc[facId].contenedores.length);

      return acc;
    }, {});

    return Object.values(agrupado);
  }, [contenedores]);

  const crearIconoFacultad = (nivelPromedio, codigoFacultad) => {
    let colorClass = 'marker-green';
    if (nivelPromedio > 50 && nivelPromedio <= 80) colorClass = 'marker-yellow';
    if (nivelPromedio > 80) colorClass = 'marker-red';

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
    if (!capacidad || !porcentaje) return 0;
    return ((capacidad * porcentaje) / 100).toFixed(1);
  };

  const calcularKg = (litros, factor) => {
    const factorNum = parseFloat(factor) || 1;
    return (parseFloat(litros) * factorNum).toFixed(1);
  };

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
    const badgeStyle = { backgroundColor: color, color: '#ffffff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' };

    if (n.includes('reciclable') && !n.includes('no')) {
      return (
        <span style={badgeStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 19 3 15 7 11"></polyline><path d="M21 13a7 7 0 0 0-7-7H3"></path><polyline points="17 5 21 9 17 13"></polyline><path d="M3 11a7 7 0 0 0 7 7h11"></path>
          </svg>
          {nombre}
        </span>
      );
    }
    if (n.includes('orgánico') || n.includes('organico')) {
      return (
        <span style={badgeStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-5 11-10 11z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
          {nombre}
        </span>
      );
    }
    return (
      <span style={badgeStyle}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
        {nombre || "No Reciclable"}
      </span>
    );
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>
      </button>
    );
  };

  return (
    <div className="mapa-container fade-in">

      <div className="mapa-header-card">
        <div className="header-titles">
          <h2>Mapa del Campus - UTN</h2>
          <p>Selecciona una facultad para ver el detalle de sus contenedores.</p>
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

              {posicionUsuario && (
                <Marker position={posicionUsuario} icon={iconoUsuario}>
                  <Popup>Estás aquí</Popup>
                </Marker>
              )}

              {facultadesAgrupadas.map(fac => (
                <Marker
                  key={fac.id}
                  position={[fac.latitud, fac.longitud]}
                  icon={crearIconoFacultad(fac.nivelPromedio, fac.codigo)}
                  eventHandlers={{
                    click: () => {
                      setFacultadSeleccionada(fac);
                    },
                  }}
                >
                  <Popup className="custom-popup">
                    <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {fac.nombre}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{fac.contenedores.length} contenedores</span>
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
              <button className="btn-close-panel" onClick={() => setFacultadSeleccionada(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="panel-estadisticas">
              <div className="stat-box">
                <span className="stat-num">{facultadSeleccionada.contenedores.length}</span>
                <span className="stat-label">Contenedores</span>
              </div>
              <div className="stat-box">
                <span className={`stat-num ${facultadSeleccionada.nivelPromedio > 80 ? 'text-danger' : 'text-success'}`}>
                  {facultadSeleccionada.nivelPromedio}%
                </span>
                <span className="stat-label">Promedio Llenado</span>
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

                const colorHex = obtenerColorHex(cont);
                const tipoResiduoNombre = cont.conTipoResiduo?.treNombre || cont.tipoResiduo?.nombre;

                return (
                  <div key={cont.conId || cont.id} className="mini-contenedor-card" style={{ borderLeft: `4px solid ${colorHex}` }}>
                    <div className="mini-card-top">
                      <strong>{cont.conCodigo || cont.codigo}</strong>
                      <span className={`status-badge ${nivel > 80 ? 'lleno' : 'operativo'}`}>
                        {nivel}%
                      </span>
                    </div>
                    <div className="mini-card-body">
                      <p className="ubicacion-txt">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {cont.conDescripcionUbicacion}
                      </p>
                      <div style={{ marginTop: '6px' }}>
                        <ResiduoBadgeSVG nombre={tipoResiduoNombre} colorHex={colorHex} />
                      </div>
                    </div>
                    <div className="progress-bar mt-2" style={{ height: '6px' }}>
                      <div
                        className={`progress-fill ${nivel > 80 ? 'danger' : 'success'}`}
                        style={{ width: `${nivel}%` }}
                      ></div>
                    </div>
                    <div className="mini-card-footer">
                      <small>
                        Lleno: {llenoL} L <span style={{ fontWeight: '600', color: '#6c757d' }}>({llenoKg} kg)</span> / {capacidadL} L <span style={{ color: '#6c757d' }}>({capacidadKg} kg)</span>
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