/**
 * @fileoverview Punto de entrada principal de la aplicación React - GastroVerse.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este archivo se encarga de renderizar el componente raíz de la aplicación (`App`)
 * en el DOM. También configura dependencias globales como el proveedor de autenticación
 * y el elemento raíz para la librería de modales.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';

/**
 * Asocia la librería `react-modal` con el elemento raíz de la aplicación ('#root').
 * Esto es crucial para la accesibilidad, ya que permite al modal ocultar
 * el resto del contenido de la aplicación a los lectores de pantalla cuando está abierto.
 * @see {@link https://reactcommunity.org/react-modal/accessibility/}
 */
Modal.setAppElement('#root');

/**
 * Renderiza la aplicación React en el elemento del DOM con el id 'root'.
 * La aplicación se envuelve en:
 * - `React.StrictMode`: Para activar comprobaciones y advertencias adicionales en desarrollo.
 * - `AuthProvider`: Para proporcionar el contexto de autenticación a todos los componentes hijos.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);