import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Landing from './javascript/Landing';
import Login from './javascript/Login';
import ResetPassword from './javascript/ResetPassword';
import EncargadoLayout from './javascript/encargado/EncargadoLayout';
import Recoleccion from './javascript/encargado/Recoleccion';
import Llenado from './javascript/encargado/Llenado';
import MapaCampus from './javascript/mapa/MapaCampus'; 
import Perfil from './javascript/perfil/Perfil';
import AdminLayout from './javascript/admin/AdminLayout';
import Colecciones from './javascript/admin/Colecciones';
import GestionUsuarios from './javascript/admin/GestionUsuarios';
import Metricas from './javascript/admin/Metricas';
import Logros from './javascript/admin/Logros';
import Contenedores from './javascript/admin/Contenedores';
import ReportesIncidencias from './javascript/admin/ReportesIncidencias';
import MapaCampusAdmin from './javascript/mapa/MapaCampusAdmin';

import VistaEstudiante from './javascript/estudiante/VistaEstudiante';
import EstudianteLayout from './javascript/estudiante/EstudianteLayout';

const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute allowedRole="ENCARGADO" />}>
          <Route path="/encargado" element={<EncargadoLayout />}>
            <Route index element={<MapaCampus />} />
            <Route path="mapa" element={<MapaCampus />} />
            <Route path="recoleccion" element={<Recoleccion />} />
            <Route path="llenado" element={<Llenado />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="ESTUDIANTE" />}>
          <Route path="/estudiante" element={<EstudianteLayout />}>
            <Route index element={<VistaEstudiante />} />
            <Route path="challenges" element={<VistaEstudiante />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="mapa" element={<MapaCampus />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="ADMINISTRADOR" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="mapa" replace />} />
            <Route path="mapa" element={<MapaCampusAdmin />} />
            <Route path="colecciones" element={<Colecciones />} />
            <Route path="metricas" element={<Metricas />} />
            <Route path="logros" element={<Logros />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path='contenedores' element={<Contenedores />} />
            <Route path='reportes-incidencias' element={<ReportesIncidencias />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;