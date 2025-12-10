/**
 * @fileoverview Página de inicio de sesión de usuario.
 * @author Ronald Niño
 * @version 1.2.0 - Mejorado manejo de redirección después de 2FA
 * @description Este componente renderiza un formulario que permite a los usuarios
 * existentes iniciar sesión en la aplicación. Utiliza el contexto de autenticación
 * para manejar la lógica de login y redirige al usuario en caso de éxito.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

/**
 * Componente funcional que representa la página de inicio de sesión.
 * @returns {JSX.Element} El formulario de inicio de sesión.
 */
const LoginPage = () => {
  // --- ESTADOS DEL FORMULARIO ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- HOOKS ---
  const { 
    login, 
    requires2FA, 
    twoFAFlow, 
    isAuthenticated 
  } = useAuth();
  
  const navigate = useNavigate();

  // ⭐⭐ NUEVO: Efecto para redirigir cuando se autentica
  useEffect(() => {
    // Si el usuario está autenticado y no está en proceso de 2FA, redirigir
    if (isAuthenticated && !requires2FA && !twoFAFlow.showModal) {
      console.log('✅ Usuario autenticado, redirigiendo a /');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, requires2FA, twoFAFlow.showModal, navigate]);

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Llama a la función `login` del contexto y maneja las respuestas de éxito o error.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   * @async
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      // Si login no lanzó error y no requiere 2FA, redirigir
      // Nota: El useEffect ahora manejará la redirección automáticamente
      console.log('Login result:', result);
    } catch (err) {
      // Manejar error especial de 2FA
      if (err.message === 'REQUIRES_2FA') {
        // El modal de 2FA se mostrará automáticamente a través del AuthContext
        setError('Se requiere verificación de dos factores. Por favor, revisa tu aplicación autenticadora.');
      } else {
        // Muestra un mensaje de error si el login falla.
        setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ⭐⭐ MEJORADO: Mostrar estado de carga mientras se completa 2FA
  if (requires2FA && twoFAFlow.showModal) {
    return (
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>Verificación en Progreso</h2>
          <div className="twofa-prompt">
            <div className="loading-spinner"></div>
            <p>📱 Por favor, ingresa el código de 6 dígitos en el modal.</p>
            <p>El modal debería aparecer encima de esta pantalla.</p>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario ya está autenticado, mostrar mensaje de redirección
  if (isAuthenticated) {
    return (
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>Redirigiendo...</h2>
          <div className="twofa-prompt">
            <div className="loading-spinner"></div>
            <p>✅ Inicio de sesión exitoso. Redirigiendo a la página principal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
        <p className="auth-switch">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;