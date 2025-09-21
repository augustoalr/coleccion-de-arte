// Este archivo centraliza la configuración de la URL de la API.
// Lee la variable de entorno VITE_API_URL, que se configurará en el servicio de hosting (Vercel).
// Si no encuentra la variable de entorno, usa la URL local como respaldo para el desarrollo.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default API_URL;
