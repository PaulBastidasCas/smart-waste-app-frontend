import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './javascript/Landing'; 
import Login from './javascript/Login';
import ResetPassword from './javascript/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* La ruta principal ahora carga la Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;