import { createContext } from 'react';

// Este archivo se crea para cumplir con la regla de ESLint de que los archivos
// solo deben exportar componentes de React para que el Fast Refresh funcione correctamente.
// Aquí solo se define y exporta el contexto.

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export default AuthContext;
