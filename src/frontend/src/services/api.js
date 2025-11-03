/**
 * @fileoverview Configuración centralizada del cliente HTTP (axios) para la API de GastroVerse.
 * @author Ronald Niño
 * @version 1.0.0
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

export default apiClient;