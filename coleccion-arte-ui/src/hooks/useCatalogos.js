import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API_URL from '../apiConfig'; // Importar la URL base

export const useCatalogos = () => {
  const [estados, setEstados] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/ubicaciones`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setUbicaciones(data);
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };

    const fetchEstados = async () => {
      if (!token) return;
      try {
        const resEstados = await fetch(`${API_URL}/api/estados`, { headers: { 'Authorization': `Bearer ${token}` } });
        const dataEstados = await resEstados.json();
        setEstados(dataEstados);
      } catch (error) {
        console.error("Error al cargar estados:", error);
      }
    };

    fetchUbicaciones();
    fetchEstados();
  }, [token]);

  return { estados, ubicaciones };
};