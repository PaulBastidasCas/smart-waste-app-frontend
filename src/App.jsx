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
            <Route path="llenado" element={<Llenado />}/>
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="ESTUDIANTE" />}>
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;