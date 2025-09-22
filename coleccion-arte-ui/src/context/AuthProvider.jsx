import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import API_URL from '../apiConfig';
import AuthContext from './AuthContext'; // Importar el contexto desde su nuevo archivo

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, email: decoded.email, rol: decoded.rol });
      } catch (error) {
        console.error("Token inválido:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Credenciales inválidas');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (error) {
      console.error("Error de login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const refrescarUsuario = () => {
    // Simple function to refresh user data from token
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, email: decoded.email, rol: decoded.rol });
      } catch (error) {
        console.error("Error refreshing user:", error);
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refrescarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};