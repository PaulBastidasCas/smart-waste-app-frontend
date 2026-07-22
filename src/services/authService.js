import api from './api';

export const login = async (credenciales) => {
    const response = await api.post(`/auth/login`, credenciales);
    if (response.data.token) localStorage.setItem('token', response.data.token);
    return response.data;
};

export const register = async (datosUsuario) => {
    const payload = { ...datosUsuario, rolId: 1 };
    return await api.post(`/auth/registro`, payload);
};

export const solicitarRecuperacion = async (correo) => {
    return await api.post(`/auth/olvide-password`, null, { params: { correo } });
};

export const logout = () => localStorage.removeItem('token');

export const restablecerPassword = async (token, nuevaClave) => {
    return await api.post(`/auth/reset-password`, null, { params: { token, nuevaClave } });
};