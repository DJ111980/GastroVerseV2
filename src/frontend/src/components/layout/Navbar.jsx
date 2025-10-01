/**
 * @fileoverview Componente de la barra de navegación principal de la aplicación.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza la barra de navegación superior. Muestra
 * diferentes enlaces y acciones dependiendo de si el usuario está autenticado o no,
 * utilizando la información del `AuthContext`.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Navbar.css';

/**
 * Componente funcional que representa la barra de navegación.
 * @returns {JSX.Element} La barra de navegación.
 */
const Navbar = () => {
  /**
   * Obtiene el estado de autenticación, el objeto de usuario y la función de logout
   * del contexto de autenticación.
   * @type {{isAuthenticated: boolean, user: object|null, logout: Function}}
   */
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja la acción de cierre de sesión.
   * Llama a la función `logout` del contexto y redirige al usuario a la página de login.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Enlace del logo que siempre redirige a la página de inicio. */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="GastroVerse Logo" className="navbar-logo-img" />
          GastroVerse
        </Link>
        
        <ul className="navbar-menu">
          {/**
           * Renderizado condicional del menú de navegación.
           * Si `isAuthenticated` es true, se muestra el menú para usuarios autenticados.
           * De lo contrario, se muestra el menú para visitantes.
           */}
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/mis-recetas" className="navbar-link">Mis Recetas</Link>
              </li>
              <li className="navbar-item">
                <Link to="/favoritos" className="navbar-link">Favoritos</Link>
              </li>
              <li className="navbar-item">
                <Link to="/recetas/crear" className="navbar-link">Crear Receta</Link>
              </li>
              <li className="navbar-item">
                <Link to="/perfil" className="navbar-link">
                  {user?.nombre}
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">Iniciar Sesión</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link navbar-link-cta">Registrarse</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;