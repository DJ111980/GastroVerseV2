/**
 * @fileoverview Componente de orden superior para proteger rutas.
 * @author Ronald Niño
 * @version 1.0.0
 * @description Este componente actúa como un guardián para las rutas que requieren
 * autenticación. Verifica el estado de autenticación del usuario a través del
 * `AuthContext` y decide si renderizar la ruta solicitada o redirigir
 * al usuario a la página de inicio de sesión.
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente funcional que protege un conjunto de rutas anidadas.
 * @returns {JSX.Element} El componente `<Outlet />` que renderiza la ruta hija si el usuario
 * está autenticado, o el componente `<Navigate />` que redirige a la página de login.
 */
const ProtectedRoute = () => {
  /**
   * Obtiene el estado de autenticación y el estado de carga del contexto.
   * @type {{isAuthenticated: boolean, loading: boolean}}
   */
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  /**
   * Muestra un mensaje de carga mientras el `AuthContext` verifica el token
   * inicial al cargar la aplicación. Esto previene redirecciones prematuras.
   */
  if (loading) {
    return (
      <div className="status-message">
        Verificando autenticación...
      </div>
    );
  }

  /**
   * Si la carga ha terminado y el usuario no está autenticado, lo redirige
   * a la página de login.
   * Se pasa la ubicación actual (`location`) en el estado de la navegación
   * para poder redirigir al usuario de vuelta a la página que intentaba
   * acceder después de un inicio de sesión exitoso.
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * Si el usuario está autenticado, se renderiza el componente `<Outlet />`.
   * `<Outlet />` es un placeholder de `react-router-dom` que renderiza el
   * componente de la ruta hija que coincide con la URL actual.
   */
  return <Outlet />;
};

export default ProtectedRoute;