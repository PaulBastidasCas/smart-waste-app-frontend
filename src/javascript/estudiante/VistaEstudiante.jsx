import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Estudiante.css';

const VistaEstudiante = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [facultyStats, setFacultyStats] = useState({
    totalKg: 0,
    totalRecolecciones: 0,
    actividades: []
  });
  const [ranking, setRanking] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const xpPerKg = 15;
  const xpPerLevel = 200;

  const fetchDashboardData = async () => {
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    try {
      const email = localStorage.getItem('correo') || decoded?.sub || decoded?.username || 'estudiante@utn.edu.ec';
      
      let userResponse;
      try {
        userResponse = await api.get(`/usuarios/correo/${email}`);
      } catch (err) {
        userResponse = {
          data: {
            usuId: 'student-uuid',
            usuNombre: 'Alex',
            usuApellido: 'García',
            usuCorreo: email,
            usuFacultad: { facId: 1, facNombre: 'FACAE', facCodigo: 'FACAE' },
            usuFotoPerfilBase64: null
          }
        };
      }
      const user = userResponse.data;
      setProfile(user);

      if (user.usuId) {
        localStorage.setItem('usuarioId', user.usuId);
      }

      const facultyId = user.usuFacultad?.facId || 1;

      try {
        const statsRes = await api.get(`/recolecciones/facultad/${facultyId}`);
        setFacultyStats({
          totalKg: statsRes.data.totalKg || 0,
          totalRecolecciones: statsRes.data.totalRecolecciones || 0,
          actividades: statsRes.data.actividades || []
        });
      } catch (err) {
        console.error('Error fetching faculty stats:', err);
      }

      try {
        const challengesRes = await api.get(`/gamificacion/estudiante/desafios-activos?correo=${email}`);
        setActiveChallenges(challengesRes.data || []);
      } catch (err) {
        console.error('Error fetching challenges:', err);
      }

      try {
        const date = new Date();
        const rankingRes = await api.get(`/gamificacion/ranking-mensual?anio=${date.getFullYear()}&mes=${date.getMonth() + 1}`);
        setRanking(rankingRes.data || []);
      } catch (err) {
        console.error('Error loading ranking:', err);
        setRanking([
          { ranId: 1, ranFacultad: { facId: 1, facNombre: 'FACAE', facCodigo: 'FACAE' }, ranPuntosTotal: 2100, ranKgReciclados: 140, ranPosicion: 1 },
          { ranId: 2, ranFacultad: { facId: 2, ranFacNombre: 'FICA', facCodigo: 'FICA' }, ranPuntosTotal: 1850, ranKgReciclados: 123, ranPosicion: 2 },
          { ranId: 3, ranFacultad: { facId: 3, ranFacNombre: 'FECYT', facCodigo: 'FECYT' }, ranPuntosTotal: 1620, ranKgReciclados: 108, ranPosicion: 3 },
          { ranId: 4, ranFacultad: { facId: 4, ranFacNombre: 'POSTGRADO', facCodigo: 'POSTGRADO' }, ranPuntosTotal: 1240, ranKgReciclados: 82, ranPosicion: 4 }
        ]);
      }

      try {
        if (user.usuId) {
          const allInsigniasRes = await api.get('/insignias');
          const allInsignias = allInsigniasRes.data || [];

          const unlockedRes = await api.get(`/gamificacion/feed-insignias/${user.usuId}`);
          const unlockedBadges = unlockedRes.data || [];

          const mergedBadges = allInsignias.map(ins => {
             const wonBadge = unlockedBadges.find(ub => ub.insNombre === ins.insNombre);
             return {
                ...ins,
                finGanadaEn: wonBadge ? (wonBadge.finGanadaEn || true) : null
             };
          });

          setBadges(mergedBadges);
        }
      } catch (err) {
        console.error('Error fetching badges:', err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading student dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalKg = facultyStats.totalKg;
  const totalXP = Math.floor(totalKg * xpPerKg) + 340; 
  const currentLevel = Math.floor(totalXP / xpPerLevel) + 1;
  const currentXPInLevel = totalXP % xpPerLevel;
  const xpPercentage = Math.min(100, Math.floor((currentXPInLevel / xpPerLevel) * 100));

  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  const userFacCode = profile?.usuFacultad?.facCodigo || 'FACAE';
  const topFaculties = ranking.slice(0, 3);
  const userRankRow = ranking.find(r => (r.ranFacultad?.facCodigo || r.ranFacultad?.facNombre) === userFacCode);
  const userRankPos = userRankRow ? ranking.indexOf(userRankRow) + 1 : 4;
  const userRankPoints = userRankRow ? userRankRow.ranPuntosTotal : totalXP;

  const getFirstName = (fullName) => {
    if (!fullName) return 'Estudiante';
    return fullName.trim().split(/\s+/)[0];
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Hace un momento';
    try {
      const normalizedDate = dateStr.replace('T', ' ');
      const date = new Date(normalizedDate);
      const now = new Date();
      const diffMs = now - date;
      if (isNaN(diffMs)) return 'Recientemente';
      
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Hace un momento';
      if (mins < 60) return `Hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
      
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      
      const days = Math.floor(hours / 24);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } catch (e) {
      return 'Recientemente';
    }
  };

  if (loading) {
    return (
      <div className="perfil-loading">
        Cargando logros y metas de la facultad...
      </div>
    );
  }

  return (
    <div className="estudiante-container">
      <header className="dashboard-header">
        <h1>Desafíos y Gamificación</h1>
      </header>

      <div className="dashboard-grid">
        
        <div className="dashboard-col">
          
          {/* Greeting and Community Goal Card */}
          <div className="estudiante-card">
            {/* Greet Section */}
            <div className="greet-section">
              <div className="greet-info">
                <div className="greet-avatar-container">
                  <div className="greet-avatar-box">
                    {profile?.usuFotoPerfilBase64 ? (
                      <img 
                        src={profile.usuFotoPerfilBase64} 
                        alt="Avatar" 
                        className="greet-avatar-img"
                      />
                    ) : (
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <span className="badge-check-ok">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 805, color: 'var(--text-dark)', margin: 0 }}>
                    ¡Hola, {getFirstName(profile?.usuNombre)}!
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', margin: '4px 0 0 0', fontWeight: 600 }}>
                    Lvl. {currentLevel} • Ambientalista Pro
                  </p>
                </div>
              </div>

              <div className="xp-badge-box">
                <span className="xp-points">
                  {userRankPoints.toLocaleString()} pts
                </span>
                <span className="xp-next-level">
                  Próximo nivel: {(Math.floor(userRankPoints / xpPerLevel) + 1) * xpPerLevel} pts
                </span>
              </div>
            </div>

            <div className="community-panel" style={{ marginTop: '1.2rem' }}>
              <div className="community-header">
                <div className="community-text">
                  <span className="community-tag">META COMUNITARIA</span>
                  <h3>Meta del Mes UTN</h3>
                  <p>Juntos por un campus 100% libre de residuos orgánicos mal clasificados.</p>
                </div>

                <div className="radial-loader-wrapper">
                  <svg width="80" height="80" className="transform -rotate-90">
                    <circle 
                      cx="40" 
                      cy="40" 
                      r={radius} 
                      style={{ color: '#e2e8f0' }} 
                      strokeWidth="6" 
                      fill="transparent" 
                      stroke="currentColor"
                    />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r={radius} 
                      style={{ color: 'var(--eco-primary)', transition: 'stroke-dashoffset 0.6s' }} 
                      strokeWidth="6" 
                      fill="transparent" 
                      stroke="currentColor"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (0.68 * circumference)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="radial-percentage">
                    <span>68%</span>
                    <p>Progreso</p>
                  </div>
                </div>
              </div>

              <div className="progress-container" style={{ marginTop: '4px' }}>
                <div className="progress-track">
                  <div className="progress-bar-fill" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="community-footer">
                <div className="avatars-row">
                  <div className="avatars-overlap">
                    <img className="avatar-overlap-img" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="u1" />
                    <img className="avatar-overlap-img" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="u2" />
                    <img className="avatar-overlap-img" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80" alt="u3" />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)', fontWeight: 600 }}>
                    +2.4k universitarios
                  </span>
                </div>

                <div>
                  <span>Finaliza en: <strong style={{ color: 'var(--text-dark)' }}>12 días</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="estudiante-card">
            <div className="challenges-header">
              <h3>Mis Desafíos Activos (Calidad de Reciclaje)</h3>
              <span className="xp-next-level hover:text-slate-700" style={{ cursor: 'pointer' }}>Ver todos</span>
            </div>

            <div className="challenges-list">
              {activeChallenges.length > 0 ? (
                activeChallenges.map((ch) => {
                  const progressPct = ch.retProgresoPct.doubleValue ? ch.retProgresoPct.doubleValue() : ch.retProgresoPct;
                  return (
                    <div key={ch.retId} className="challenge-item" style={{ borderLeft: '4px solid #0ea5e9' }}>
                      <div className="challenge-icon-box" style={{ color: '#0ea5e9', backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0a3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
                        </svg>
                      </div>

                      <div className="challenge-content">
                        <h4>{ch.retTitulo}</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-gray)', margin: '2px 0 6px 0' }}>
                          {ch.retDescripcion}
                        </p>
                        <div className="challenge-progress-row">
                          <div className="progress-track" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${progressPct}%`, backgroundColor: '#0ea5e9' }}></div>
                          </div>
                          <span className="challenge-progress-text" style={{ color: '#0369a1', fontWeight: 700 }}>
                            {progressPct.toFixed(0)}/100% de efectividad
                          </span>
                        </div>
                      </div>

                      <span className="challenge-reward" style={{ color: '#0369a1', backgroundColor: '#e0f2fe' }}>
                        +250 pts
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ 
                  color: '#15803d', 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: '12px', 
                  padding: '1.25rem', 
                  fontSize: '0.8rem', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}>
                  ¡Felicidades! Tu facultad mantiene un excelente desempeño. No hay desafíos de clasificación críticos activos esta semana. ¡Sigue separando tus residuos correctamente!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-col">
          
          <div className="estudiante-card">
            <h3 className="estudiante-card-title">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>Mis Insignias</span>
            </h3>

            <div className="insignias-grid">
              {badges && badges.length > 0 ? (
                badges.map((badge, idx) => {
                  const unlocked = !!badge.finGanadaEn;
                  const colorClass = idx % 2 === 0 ? "insignia-circle-active-emerald" : "insignia-circle-active-teal";
                  return (
                    <div key={idx} className="insignia-badge-item" title={`${badge.insNombre} - ${unlocked ? 'Desbloqueado' : 'Bloqueado'}`}>
                      <div className={`insignia-circle ${unlocked ? colorClass : 'insignia-circle-locked'}`}>
                        {unlocked ? '⚡' : '🔒'}
                      </div>
                      <span>{badge.insNombre}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: 'span 4', color: 'var(--text-gray)', fontSize: '0.75rem', textAlign: 'center' }}>
                  No hay insignias registradas.
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.65rem', color: 'var(--text-gray)', textAlign: 'center', marginTop: '1.25rem', fontStyle: 'italic', margin: '1rem 0 0 0' }}>
              Logros vinculados a la Facultad de {profile?.usuFacultad?.facNombre || 'FACAE'}.
            </p>
          </div>

          <div className="estudiante-card">
            <div className="ranking-header">
              <h3>Ranking del Mes</h3>
              <span className="ranking-top-badge">Top 3</span>
            </div>

            <div className="ranking-list">
              {topFaculties.map((row, idx) => {
                const facCode = row.ranFacultad?.facCodigo || row.ranFacultad?.facNombre || '';
                const isUserFaculty = facCode === userFacCode;
                return (
                  <div 
                    key={row.ranId || idx}
                    className={`ranking-row ${isUserFaculty ? 'ranking-row-active' : ''}`}
                  >
                    <div className="ranking-left">
                      <span className="ranking-pos">
                        {idx + 1}
                      </span>
                      <div className="ranking-logo-box">
                        {facCode.substring(0, 2)}
                      </div>
                      <div className="ranking-info">
                        <h4>Facultad {facCode}</h4>
                        <p>Campus El Olivo</p>
                      </div>
                    </div>
                    <span className="ranking-points">
                      {row.ranPuntosTotal?.toLocaleString() || '0'} pts
                    </span>
                  </div>
                );
              })}

              {userRankPos > 3 && (
                <>
                  <div className="divider-ranking"></div>
                  <div className="ranking-row ranking-row-active">
                    <div className="ranking-left">
                      <span className="ranking-pos" style={{ color: 'var(--eco-primary)' }}>
                        {userRankPos}
                      </span>
                      <div className="ranking-logo-box">
                        {userFacCode.substring(0, 2)}
                      </div>
                      <div className="ranking-info">
                        <h4>Facultad {userFacCode} (Tú)</h4>
                        <p>Campus El Olivo</p>
                      </div>
                    </div>
                    <span className="ranking-points">
                      {userRankPoints.toLocaleString()} pts
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="estudiante-card">
            <h3 className="estudiante-card-title">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Actividad Reciente</span>
            </h3>

            <div className="timeline-activity">
              {facultyStats.actividades && facultyStats.actividades.length > 0 ? (
                facultyStats.actividades.slice(0, 3).map((act, idx) => (
                  <div key={act.id || idx} className="timeline-item">
                    <span className={idx === 0 ? "timeline-dot" : idx === 1 ? "timeline-dot-secondary" : "timeline-dot-gray"}></span>
                    <p>
                      {formatRelativeTime(act.fecha)} se recolectó {act.peso}kg en la {profile?.usuFacultad?.facNombre} (+{((act.peso / 300.0) * 100.0).toFixed(1)}% de beneficio para la facultad)
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-gray)', fontSize: '0.75rem', padding: '10px 0', textAlign: 'center', fontStyle: 'italic' }}>
                  Sin actividad de recolección en la facultad este mes
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VistaEstudiante;
