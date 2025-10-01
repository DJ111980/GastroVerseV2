/**
 * @fileoverview Página de inicio de sesión de usuario.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza un formulario que permite a los usuarios
 * existentes iniciar sesión en la aplicación. Utiliza el contexto de autenticación
 * para manejar la lógica de login y redirige al usuario en caso de éxito.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthForm.css";
import logo from "../assets/logo.png";

/**
 * Componente funcional que representa la página de inicio de sesión.
 * @returns {JSX.Element} El formulario de inicio de sesión.
 */
const LoginPage = () => {
  // --- ESTADOS DEL FORMULARIO ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- HOOKS ---
  const { login } = useAuth(); // Obtiene la función de login del contexto de autenticación.
  const navigate = useNavigate(); // Hook para la navegación programática.

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Llama a la función `login` del contexto y maneja las respuestas de éxito o error.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   * @async
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/perfil"); // Redirige a la página de inicio tras un login exitoso.
    } catch (err) {
      // Muestra un mensaje de error si el login falla.
      setError(
        err.response?.data?.error ||
          "Error al iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Entrar"}
        </button>
        <p className="auth-switch">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
