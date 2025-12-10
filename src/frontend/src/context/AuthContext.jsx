/**
 * @fileoverview Contexto de autenticación para la aplicación GastroVerse.
 * @author Ronald Niño
 * @version 1.1.0 - Agregado soporte para 2FA
 * @description Este archivo crea y gestiona el estado global de autenticación.
 * Proporciona un contexto con la información del usuario, el token, y funciones
 * para iniciar sesión, cerrar sesión y validar el estado de autenticación.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient, { twoFactorAPI } from '../services/api';
import { toast } from 'react-toastify';

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
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [twoFAFlow, setTwoFAFlow] = useState({
    showModal: false,
    showSetupModal: false,
    showBackupModal: false,
    qrCode: null,
    secret: null
  });

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
    
    // Verificar si requiere 2FA
    if (response.data.requiere_2fa) {
      setRequires2FA(true);
      setTempToken(response.data.token_temporal);
      setTwoFAFlow(prev => ({ ...prev, showModal: true }));
      throw new Error('REQUIRES_2FA'); // Error especial para manejar en LoginPage
    }
    
    // Si no requiere 2FA, continuar normal
    const { token: newToken, usuario } = response.data;
    setToken(newToken);
    setUser(usuario);
    return { requires2FA: false };
  };

  /**
   * Verificar código 2FA
   * @param {string} token_2fa - Código de 6 dígitos
   * @returns {Promise<object>} Resultado de la verificación
   */
  const verify2FA = async (token_2fa) => {
  try {
    const response = await twoFactorAPI.verify2FA(token_2fa, tempToken);
    const { token: newToken, usuario } = response.data;
    
    setToken(newToken);
    setUser(usuario);
    setRequires2FA(false);
    setTempToken(null);
    setTwoFAFlow(prev => ({ ...prev, showModal: false }));
    
    toast.success('Verificación 2FA exitosa');
    
    return { success: true, shouldRedirect: true };
  } catch (error) {
    toast.error(error.response?.data?.error || 'Código 2FA inválido');
    return { success: false, error: error.response?.data };
  }
};

  /**
   * Verificar código de respaldo
   * @param {string} backup_code - Código de respaldo de 8 dígitos
   * @returns {Promise<object>} Resultado de la verificación
   */
  const verifyBackupCode = async (backup_code) => {
    try {
      const response = await twoFactorAPI.verifyBackupCode(backup_code, tempToken);
      const { token: newToken, usuario } = response.data;
      
      setToken(newToken);
      setUser(usuario);
      setRequires2FA(false);
      setTempToken(null);
      setTwoFAFlow(prev => ({ ...prev, showBackupModal: false }));
      
      toast.success('Acceso con código de respaldo exitoso');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Código de respaldo inválido');
      return { success: false, error: error.response?.data };
    }
  };

  /**
   * Iniciar setup de 2FA
   * @returns {Promise<object>} Datos del setup (QR code)
   */
  const setup2FA = async () => {
    try {
      const response = await twoFactorAPI.setup2FA();
      const { qr_code_url, secret, otpauth_url } = response.data;
      
      setTwoFAFlow(prev => ({
        ...prev,
        showSetupModal: true,
        qrCode: qr_code_url,
        secret: secret,
        otpauthUrl: otpauth_url
      }));
      
      return { success: true, qr_code_url, secret, otpauth_url };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al configurar 2FA');
      return { success: false, error: error.response?.data };
    }
  };

  /**
   * Activar 2FA con código de verificación
   * @param {string} token_2fa - Código de 6 dígitos
   * @returns {Promise<object>} Resultado con códigos de respaldo
   */
  const enable2FA = async (token_2fa) => {
    try {
      const response = await twoFactorAPI.enable2FA(token_2fa);
      const { backup_codes, mensaje } = response.data;
      
      // Actualizar estado del usuario
      const updatedUser = { ...user, two_factor_enabled: true };
      setUser(updatedUser);
      
      setTwoFAFlow(prev => ({ ...prev, showSetupModal: false }));
      toast.success(mensaje || '2FA activado exitosamente');
      
      return { success: true, backup_codes };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al activar 2FA');
      return { success: false, error: error.response?.data };
    }
  };

  /**
   * Desactivar 2FA
   * @returns {Promise<object>} Resultado de la operación
   */
  const disable2FA = async () => {
    try {
      await twoFactorAPI.disable2FA();
      
      // Actualizar estado del usuario
      const updatedUser = { ...user, two_factor_enabled: false };
      setUser(updatedUser);
      
      toast.success('2FA desactivado exitosamente');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al desactivar 2FA');
      return { success: false, error: error.response?.data };
    }
  };

  /**
   * Cerrar modales de 2FA
   */
  const close2FAModals = () => {
    setTwoFAFlow({
      showModal: false,
      showSetupModal: false,
      showBackupModal: false,
      qrCode: null,
      secret: null,
      otpauthUrl: null
    });
    setRequires2FA(false);
    setTempToken(null);
  };

  /**
   * Mostrar modal de códigos de respaldo
   */
  const showBackupModal = () => {
    setTwoFAFlow(prev => ({ ...prev, showBackupModal: true }));
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
    close2FAModals();
  };
  
  /**
   * @description El valor que se proporcionará a los componentes consumidores del contexto.
   * @type {object}
   */
  const value = { 
    user, 
    token, 
    login, 
    logout, 
    loading, 
    isAuthenticated: !!token,
    // 2FA
    requires2FA,
    twoFAFlow,
    verify2FA,
    verifyBackupCode,
    setup2FA,
    enable2FA,
    disable2FA,
    close2FAModals,
    showBackupModal
  };

  return (
    <AuthContext.Provider value={value}>
      {/* No se renderizan los componentes hijos hasta que la carga inicial haya terminado para evitar parpadeos. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para consumir fácilmente el contexto de autenticación.
 * @returns {object} El valor del contexto de autenticación.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};