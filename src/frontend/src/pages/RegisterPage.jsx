/**
 * @fileoverview Página de registro para nuevos usuarios.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza un formulario que permite a los nuevos usuarios
 * crear una cuenta. Tras un registro exitoso, inicia sesión automáticamente
 * y redirige al usuario a la página de inicio.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AuthForm.css";

/**
 * Componente funcional que representa la página de registro.
 * @returns {JSX.Element} El formulario de registro.
 */
const RegisterPage = () => {
  // --- ESTADOS DEL FORMULARIO ---
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- HOOKS ---
  const navigate = useNavigate();
  const { login } = useAuth(); // Se usa para el inicio de sesión automático post-registro.

  /**
   * Maneja el envío del formulario de registro.
   * Primero, crea el nuevo usuario a través de la API.
   * Luego, si el registro es exitoso, inicia sesión automáticamente con las
   * mismas credenciales y redirige al usuario.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   * @async
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Paso 1: Enviar datos de registro a la API para crear el usuario.
      await apiClient.post("/usuarios", {
        nombre,
        email,
        contraseña: password,
      });

      // Paso 2: Si el paso anterior no lanzó un error, iniciar sesión automáticamente.
      await login(email, password);

      // Paso 3: Redirigir a la página de inicio.
      navigate("/");
    } catch (err) {
      // Manejo de errores de la API. Prioriza los mensajes de validación.
      const errorMsg = err.response?.data?.detalles
        ? err.response.data.detalles.join(", ")
        : err.response?.data?.error;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Crear una Cuenta</h2>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
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
            minLength="6"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <p className="auth-switch">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
