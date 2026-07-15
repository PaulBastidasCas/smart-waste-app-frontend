import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Landing from './javascript/Landing';
import Login from './javascript/Login';
import ResetPassword from './javascript/ResetPassword';
import EncargadoLayout from './javascript/encargado/EncargadoLayout';
import Recoleccion from './javascript/encargado/Recoleccion';
import MapaCampus from './javascript/mapa/MapaCampus'; 

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
        
        {/* Rutas Privadas del Encargado protegidas por ProtectedRoute */}
        <Route element={<ProtectedRoute allowedRole="ENCARGADO" />}>
          <Route path="/encargado" element={<EncargadoLayout />}>
            {/* 2. Reemplaza los <div> por el componente <MapaCampus /> */}
            <Route index element={<MapaCampus />} />
            <Route path="mapa" element={<MapaCampus />} />
            <Route path="recoleccion" element={<Recoleccion />} />
          </Route>
        </Route>

        {/* Ejemplo: Rutas Privadas del Estudiante (cuando las construyas) */}
        <Route element={<ProtectedRoute allowedRole="ESTUDIANTE" />}>
          {/* <Route path="/estudiante" element={<EstudianteLayout />} /> */}
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;