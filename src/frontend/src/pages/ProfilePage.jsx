/**
 * @fileoverview Página de perfil del usuario autenticado.
 * @author Ronald Niño
 * @version 1.0.0
 * @description Este componente muestra la información del usuario que ha iniciado sesión,
 * como su nombre, email y fecha de registro. Obtiene los datos directamente
 * del `AuthContext`.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

/**
 * Componente funcional que renderiza la página de perfil del usuario.
 * @returns {JSX.Element} La página de perfil.
 */
const ProfilePage = () => {
  /**
   * Obtiene el objeto `user` y el estado `loading` del contexto de autenticación.
   * @type {{user: object|null, loading: boolean}}
   */
  const { user, loading } = useAuth();

  /**
   * Renderizado condicional mientras se verifica la autenticación inicial de la aplicación.
   */
  if (loading) {
    return <div className="status-message">Cargando perfil...</div>;
  }

  /**
   * Renderizado condicional de seguridad.
   * Si la carga ha terminado pero no hay un objeto de usuario (ej. token inválido),
   * muestra un mensaje de error. `ProtectedRoute` ya debería haber prevenido esto.
   */
  if (!user) {
    return <div className="status-message">No se pudieron cargar los datos del perfil.</div>;
  }

  /**
   * Formatea la fecha de creación del usuario para una mejor legibilidad.
   * @type {string}
   */
  const registrationDate = new Date(user.fecha_creacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      <div className="profile-card">
        <div className="profile-info">
          <label>Nombre:</label>
          <span>{user.nombre}</span>
        </div>
        <div className="profile-info">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
        <div className="profile-info">
          <label>Miembro desde:</label>
          <span>{registrationDate}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;