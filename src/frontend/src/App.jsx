/**
 * @fileoverview Componente principal de la aplicación GastroVerse.
 * @author Ronald Niño
 * @version 1.1.0 - Agregado soporte para 2FA
 * @description Este componente actúa como el orquestador central de la aplicación.
 * Configura el enrutador, define todas las rutas (públicas y protegidas),
 * y renderiza los componentes de layout persistentes como la barra de navegación
 * y el contenedor de notificaciones.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importaciones de páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import EditIngredientsPage from './pages/EditIngredientsPage';
import MyRecipesPage from './pages/MyRecipesPage';

// Importaciones de componentes
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import TwoFactorModal from './components/common/TwoFactorModal';
import Setup2FAModal from './components/common/Setup2FAModal';

// Estilos
import './App.css'; 

/**
 * Componente funcional raíz que define la estructura de la aplicación.
 * @returns {JSX.Element} El árbol de componentes de la aplicación.
 */
function App() {
  return (
    <Router>
      {/**
       * Contenedor global para las notificaciones emergentes (toasts).
       * Se configura una sola vez aquí para estar disponible en toda la aplicación.
       * @see {@link https://fkhadra.github.io/react-toastify/introduction}
       */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/**
       * Modales de 2FA (se renderizan condicionalmente)
       */}
      <TwoFactorModal />
      <Setup2FAModal />
      
      {/**
       * Componente de la barra de navegación, visible en todas las las páginas.
       */}
      <Navbar /> 

      {/**
       * Contenedor principal para el contenido de cada página.
       */}
      <main className="main-content">
        {/**
         * Componente de `react-router-dom` que renderiza la primera ruta que coincida
         * con la URL actual.
         */}
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          {/** @description Ruta para la página de inicio. */}
          <Route path="/" element={<HomePage />} />
          {/** @description Ruta para la página de inicio de sesión. */}
          <Route path="/login" element={<LoginPage />} />
          {/** @description Ruta para la página de registro de usuario. */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* --- RUTAS PROTEGIDAS --- */}
          {/**
           * @description Un grupo de rutas que requieren autenticación.
           * El componente `ProtectedRoute` actúa como un guardián, redirigiendo
           * a los usuarios no autenticados a la página de login.
           */}
          <Route element={<ProtectedRoute />}>
            {/** @description Ruta para ver el detalle de una receta. El `:id` es un parámetro dinámico. */}
            <Route path="/recetas/:id" element={<RecipeDetailPage />} />
            {/** @description Ruta para ver el perfil del usuario autenticado. */}
            <Route path="/perfil" element={<ProfilePage />} />
            {/** @description Ruta para ver las recetas favoritas del usuario. */}
            <Route path="/favoritos" element={<FavoritesPage />} />
            {/** @description Ruta para ver las recetas creadas por el usuario. */}
            <Route path="/mis-recetas" element={<MyRecipesPage />} />
            {/** @description Ruta para el formulario de creación de nuevas recetas. */}
            <Route path="/recetas/crear" element={<CreateRecipePage />} />
            {/** @description Ruta para el formulario de edición de los detalles de una receta. */}
            <Route path="/recetas/:id/editar" element={<EditRecipePage />} />
            {/** @description Ruta para el formulario de edición de los ingredientes de una receta. */}
            <Route path="/recetas/:id/editar-ingredientes" element={<EditIngredientsPage />} />
          </Route>
          
          {/* --- RUTA 404 --- */}
          {/**
           * @description Ruta "catch-all" que se renderiza si ninguna de las rutas anteriores coincide.
           * Muestra una página de "No encontrado".
           */}
          <Route path="*" element={
            <div className="status-message">
              <h1>404: Página no encontrada</h1>
              <p>La ruta que buscas no existe. Intenta volver al inicio.</p>
            </div>
          } />
        </Routes>
      </main>
    </Router>
  );
}

export default App;