/**
 * @fileoverview Página de perfil del usuario autenticado.
 * @author Ronald Niño
 * @version 1.1.0 - Agregado gestión de 2FA
 * @description Este componente muestra la información del usuario que ha iniciado sesión,
 * como su nombre, email y fecha de registro. Obtiene los datos directamente
 * del `AuthContext`.
 */

import React, { useState } from 'react';
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
  const { user, loading, setup2FA, disable2FA } = useAuth();
  const [disabling, setDisabling] = useState(false);

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

  /**
   * Maneja la activación de 2FA
   */
  const handleEnable2FA = async () => {
    await setup2FA();
  };

  /**
   * Maneja la desactivación de 2FA
   */
  const handleDisable2FA = async () => {
    if (window.confirm('¿Estás seguro de que quieres desactivar la autenticación en dos pasos? Esto reducirá la seguridad de tu cuenta.')) {
      setDisabling(true);
      await disable2FA();
      setDisabling(false);
    }
  };

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
        
        {/* Sección de Seguridad - 2FA */}
        <div className="profile-section">
          <h3>Seguridad</h3>
          <div className="security-info">
            <div className="security-status">
              <label>Autenticación en Dos Pasos:</label>
              <span className={`status-badge ${user.two_factor_enabled ? 'enabled' : 'disabled'}`}>
                {user.two_factor_enabled ? 'ACTIVADA' : 'DESACTIVADA'}
              </span>
            </div>
            
            <div className="security-actions">
              {!user.two_factor_enabled ? (
                <button 
                  onClick={handleEnable2FA}
                  className="auth-button"
                >
                  🔒 Activar 2FA
                </button>
              ) : (
                <button 
                  onClick={handleDisable2FA}
                  className="auth-button secondary"
                  disabled={disabling}
                >
                  {disabling ? 'Desactivando...' : 'Desactivar 2FA'}
                </button>
              )}
            </div>
            
            {user.two_factor_enabled && (
              <div className="security-tip">
                <p>✅ La autenticación en dos pasos está protegiendo tu cuenta.</p>
                <p><small>Si pierdes acceso a tu autenticador, usa uno de tus códigos de respaldo.</small></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;