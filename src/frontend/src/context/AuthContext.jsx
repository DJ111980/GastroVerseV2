/**
 * @fileoverview Contexto de autenticación para la aplicación GastroVerse.
 * @author Ronald Niño
 * @version 1.0.0
 * @description Este archivo crea y gestiona el estado global de autenticación.
 * Proporciona un contexto con la información del usuario, el token, y funciones
 * para iniciar sesión, cerrar sesión y validar el estado de autenticación.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

/**
 * @description El contexto de React que almacenará el estado de autenticación.
 * @type {React.Context<object|null>}
 */
const AuthContext = createContext(null);

/**
 * Función de utilidad para establecer o eliminar el token de autorización
 * en las cabeceras por defecto de la instancia de axios.
 * @param {string|null} token - El token JWT a establecer, o null para eliminarlo.
 */
const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Componente Proveedor que envuelve la aplicación y proporciona el contexto de autenticación.
 * @param {object} props - Las propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 * @returns {JSX.Element} El proveedor de contexto con los componentes hijos.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  /**
   * Función centralizada para actualizar el estado del token, el localStorage y los headers de axios.
   * @param {string|null} newToken - El nuevo token a establecer.
   */
  const setToken = (newToken) => {
    setTokenState(newToken);
    setAuthToken(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
  };
  
  /**
   * Obtiene los datos del usuario desde la API si existe un token.
   * Se utiliza para validar la sesión al cargar la aplicación.
   * @async
   */
  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setAuthToken(token);
    setLoading(true);

    try {
      const response = await apiClient.get('/usuarios/me');
      setUser(response.data);
    } catch (error) {
      // Si el token es inválido, se limpia la sesión.
      setUser(null);
      setToken(null);
      console.error("Error de autenticación, token limpiado:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Efecto que se ejecuta al cargar la aplicación para validar el token almacenado.
   */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Realiza el proceso de inicio de sesión.
   * @param {string} email - El email del usuario.
   * @param {string} contraseña - La contraseña del usuario.
   * @async
   */
  const login = async (email, contraseña) => {
    const response = await apiClient.post('/usuarios/login', { email, contraseña });
    const { token: newToken, usuario } = response.data;
    setToken(newToken);
    setUser(usuario);
  };

  /**
   * Realiza el proceso de cierre de sesión.
   * Llama al endpoint de logout del backend y limpia el estado local.
   * @async
   */
  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/usuarios/logout');
      }
    } catch (error) {
        console.error("Error al cerrar sesión en el backend, limpiando localmente:", error);
    }
    setUser(null);
    setToken(null);
  };
  
  /**
   * @description El valor que se proporcionará a los componentes consumidores del contexto.
   * @type {{user: object|null, token: string|null, login: Function, logout: Function, loading: boolean, isAuthenticated: boolean}}
   */
  const value = { user, token, login, logout, loading, isAuthenticated: !!token };

  return (
    <AuthContext.Provider value={value}>
      {/* No se renderizan los componentes hijos hasta que la carga inicial haya terminado para evitar parpadeos. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para consumir fácilmente el contexto de autenticación.
 * @returns {{user: object|null, token: string|null, login: Function, logout: Function, loading: boolean, isAuthenticated: boolean}} El valor del contexto de autenticación.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};