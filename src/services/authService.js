import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (credenciales) => {
    const response = await axios.post(`${API_URL}/login`, credenciales);
    if (response.data.token) localStorage.setItem('token', response.data.token);
    return response.data;
};

export const register = async (datosUsuario) => {
    const payload = { ...datosUsuario, rolId: 1 };
    return await axios.post(`${API_URL}/registro`, payload);
};

export const solicitarRecuperacion = async (correo) => {
    return await axios.post(`${API_URL}/olvide-password`, null, { params: { correo } });
};

export const logout = () => localStorage.removeItem('token');

export const restablecerPassword = async (token, nuevaClave) => {
    return await axios.post(`${API_URL}/reset-password`, null, { params: { token, nuevaClave } });
};