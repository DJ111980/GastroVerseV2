// src/services/api.js
/**
 * @fileoverview Configuración centralizada del cliente HTTP (axios) para la API de GastroVerse.
 * @author Ronald Niño
 * @version 1.1.0 - Agregado soporte para 2FA
 * @description Este archivo crea y exporta una instancia de axios pre-configurada.
 * Incluye la URL base de la API desde las variables de entorno y un interceptor
 * que añade automáticamente el token de autenticación a todas las peticiones salientes.
 */

import axios from 'axios';

/**
 * Instancia de axios pre-configurada para interactuar con la API de GastroVerse.
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  /**
   * La URL base para todas las peticiones de la API.
   * Se obtiene de las variables de entorno de Vite (`.env`).
   * @type {string}
   */
  baseURL: import.meta.env.VITE_API_BASE_URL,
  /**
   * Cabeceras por defecto para todas las peticiones.
   * @type {object}
   */
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de peticiones de axios.
 * Esta función se ejecuta ANTES de que cada petición sea enviada.
 * Su propósito es obtener el token JWT del localStorage y añadirlo
 * a la cabecera 'Authorization' si existe.
 * @param {import('axios').InternalAxiosRequestConfig} config - La configuración de la petición saliente.
 * @returns {import('axios').InternalAxiosRequestConfig} La configuración modificada con el header de autorización.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  /**
   * Manejador de errores para el interceptor de peticiones.
   * Si ocurre un error durante la configuración de la petición, se propaga.
   * @param {any} error - El error ocurrido.
   * @returns {Promise<never>} Una promesa rechazada con el error.
   */
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas para manejar errores globalmente
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      window.location.href = '/login?session=expired';
    }
    return Promise.reject(error);
  }
);

/**
 * Funciones específicas para 2FA
 */
export const twoFactorAPI = {
  /**
   * Verificar código 2FA después del login
   * @param {string} token_2fa - Código de 6 dígitos
   * @param {string} token_temporal - Token temporal del login
   * @returns {Promise<object>} Respuesta con token JWT
   */
  verify2FA: (token_2fa, token_temporal) => 
    apiClient.post('/usuarios/login/verify-2fa', { token_2fa, token_temporal }),
  
  /**
   * Usar código de respaldo para acceso
   * @param {string} backup_code - Código de respaldo de 8 dígitos
   * @param {string} token_temporal - Token temporal del login
   * @returns {Promise<object>} Respuesta con token JWT
   */
  verifyBackupCode: (backup_code, token_temporal) => 
    apiClient.post('/usuarios/login/backup-code', { backup_code, token_temporal }),
  
  /**
   * Obtener configuración para setup de 2FA (QR code)
   * @returns {Promise<object>} Datos con QR code y secreto
   */
  setup2FA: () => 
    apiClient.post('/usuarios/2fa/setup'),
  
  /**
   * Activar 2FA con código de verificación
   * @param {string} token_2fa - Código de 6 dígitos
   * @returns {Promise<object>} Respuesta con códigos de respaldo
   */
  enable2FA: (token_2fa) => 
    apiClient.post('/usuarios/2fa/enable', { token_2fa }),
  
  /**
   * Desactivar 2FA
   * @returns {Promise<object>} Respuesta de confirmación
   */
  disable2FA: () => 
    apiClient.post('/usuarios/2fa/disable'),
  
  /**
   * Obtener estado actual del 2FA (desde perfil)
   * @returns {Promise<object>} Estado del 2FA
   */
  get2FAStatus: () => 
    apiClient.get('/usuarios/me')
};

export default apiClient;