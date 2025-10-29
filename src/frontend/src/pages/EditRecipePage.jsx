/**
 * @fileoverview Página para editar los detalles de una receta existente.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente carga los datos de una receta específica por su ID,
 * los muestra en un formulario, y permite al usuario modificar y guardar los cambios.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';
import './AuthForm.css';
import './CreateRecipePage.css';

/**
 * Función de utilidad para procesar un string de instrucciones y convertirlo
 * en un array de 4 pasos para rellenar el formulario.
 * @param {string} instructionsText - El string de instrucciones completo (ej. "1. Paso uno. 2. Paso dos.").
 * @returns {string[]} Un array con exactamente 4 strings, representando los pasos.
 */
const parseInstructions = (instructionsText) => {
  if (!instructionsText) return ['', '', '', ''];
  const steps = instructionsText.split(/\s*(?=\d+\.\s)/).filter(Boolean);
  const parsedSteps = steps.map(step => step.replace(/^\d+\.\s*/, '').trim());
  // Aseguramos que siempre devuelva un array de 4 elementos
  while (parsedSteps.length < 4) {
    parsedSteps.push('');
  }
  return parsedSteps.slice(0, 4);
};

/**
 * Componente funcional que renderiza el formulario de edición de recetas.
 * @returns {JSX.Element} La página de edición de recetas.
 */
const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS DEL FORMULARIO ---
  const [titulo, setTitulo] = useState('');
  const [pasos, setPasos] = useState(['', '', '', '']);
  const [tiempo_preparacion, setTiempoPreparacion] = useState('');
  const [dificultad, setDificultad] = useState('Fácil');
  
  // --- ESTADOS DE CONTROL ---
  const [loading, setLoading] = useState(true); // Para la carga inicial de datos
  const [formLoading, setFormLoading] = useState(false); // Para el envío del formulario
  const [error, setError] = useState('');

  /**
   * Efecto para cargar los datos de la receta desde la API cuando el componente se monta
   * o cuando el ID de la receta cambia.
   */
  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const response = await apiClient.get(`/recetas/${id}`);
        const recipeData = response.data;
        
        setTitulo(recipeData.titulo);
        setPasos(parseInstructions(recipeData.instrucciones));
        setTiempoPreparacion(recipeData.tiempo_preparacion || '');
        setDificultad(recipeData.dificultad);
        
      } catch (err) {
        setError("No se pudieron cargar los datos de la receta para editar.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

  /**
   * Actualiza el valor de un paso de instrucción específico en el estado.
   * @param {number} index - El índice del paso a modificar.
   * @param {string} value - El nuevo texto para el paso.
   */
  const handlePasoChange = (index, value) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = value;
    setPasos(nuevosPasos);
  };

  /**
   * Maneja el envío del formulario de edición.
   * Formatea los datos, envía una petición PUT a la API y redirige al usuario
   * a la página de detalles de la receta.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   * @async
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    const instruccionesFormateadas = pasos
      .map((paso, index) => `${index + 1}. ${paso.trim()}`)
      .filter(paso => paso.length > 3)
      .join(' ');

    const updatedRecipe = {
      titulo,
      instrucciones: instruccionesFormateadas,
      dificultad,
      ...(tiempo_preparacion && { tiempo_preparacion: parseInt(tiempo_preparacion, 10) }),
    };

    try {
      await apiClient.put(`/recetas/${id}`, updatedRecipe);
      // Navega a la página de detalles después de una actualización exitosa.
      navigate(`/recetas/${id}`, {
        replace: true,
        state: { message: '¡Receta actualizada exitosamente!' }
      });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detalles?.join('. ') || err.response.data.error || 'Ocurrió un error.');
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="status-message">Cargando datos de la receta...</div>;
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
        <h2>Editar Receta</h2>
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="titulo">Título de la Receta</label>
          <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Instrucciones</label>
          <div className="pasos-container">
            {pasos.map((paso, index) => (
              <div key={index} className="paso-input-group">
                <span className="paso-numero">{index + 1}.</span>
                <input
                  type="text"
                  placeholder={`Describe el paso ${index + 1}`}
                  value={paso}
                  onChange={(e) => handlePasoChange(index, e.target.value)}
                  required={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tiempo_preparacion">Tiempo de Preparación (minutos)</label>
          <input id="tiempo_preparacion" type="number" value={tiempo_preparacion} onChange={(e) => setTiempoPreparacion(e.target.value)} min="1" />
        </div>

        <div className="form-group">
          <label htmlFor="dificultad">Dificultad</label>
          <select id="dificultad" value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
            <option value="Fácil">Fácil</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        <button type="submit" className="auth-button" disabled={formLoading}>
          {formLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default EditRecipePage;