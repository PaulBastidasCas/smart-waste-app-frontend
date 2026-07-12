import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './javascript/Login';
import ResetPassword from './javascript/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige automáticamente la ruta raíz al componente de Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas públicas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Aquí irán tus futuras rutas privadas (ej. /dashboard) */}
      </Routes>
    </Router>
  );
}

export default App;