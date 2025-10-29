/**
 * @fileoverview Página para la creación de una nueva receta.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza un formulario que permite a los usuarios autenticados
 * introducir los detalles de una nueva receta, incluyendo un sistema dinámico para
 * añadir y eliminar pasos de instrucciones.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import './CreateRecipePage.css';

/**
 * Componente funcional que representa la página de creación de recetas.
 * @returns {JSX.Element} El formulario de creación de recetas.
 */
const CreateRecipePage = () => {
  // --- ESTADOS DEL FORMULARIO ---
  const [titulo, setTitulo] = useState('');
  const [pasos, setPasos] = useState(['', '', '', '']); 
  const [tiempo_preparacion, setTiempoPreparacion] = useState('');
  const [dificultad, setDificultad] = useState('Fácil');
  
  // --- ESTADOS DE CONTROL ---
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- HOOKS ---
  const navigate = useNavigate();
  const { user } = useAuth();

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
   * Añade un nuevo campo de texto vacío al final de la lista de pasos.
   */
  const agregarPaso = () => {
    setPasos([...pasos, '']);
  };

  /**
   * Elimina un paso de la lista de instrucciones por su índice.
   * No permite eliminar si solo queda un paso.
   * @param {number} index - El índice del paso a eliminar.
   */
  const eliminarPaso = (index) => {
    if (pasos.length <= 1) return;
    const nuevosPasos = pasos.filter((_, i) => i !== index);
    setPasos(nuevosPasos);
  };

  /**
   * Maneja el envío del formulario.
   * Valida la sesión del usuario, formatea los datos, envía la petición a la API
   * y redirige a la página de edición de ingredientes en caso de éxito.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento del formulario.
   * @async
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
        setError("Debes iniciar sesión para poder crear una receta.");
        return;
    }

    setLoading(true);

    // Formatea el array de pasos en un único string numerado.
    const instrucciones = pasos
      .filter(paso => paso.trim() !== '')
      .map((paso, index) => `${index + 1}. ${paso.trim()}`)
      .join(' ');

    if (!instrucciones) {
        setError("Debes añadir al menos una instrucción.");
        setLoading(false);
        return;
    }

    const recipeData = {
      titulo,
      instrucciones,
      tiempo_preparacion: tiempo_preparacion ? Number(tiempo_preparacion) : null,
      dificultad,
      usuario_id: user.id
    };

    try {
      const response = await apiClient.post('/recetas', recipeData);
      
      if (response.data && (response.data.id || response.data.receta?.id)) {
        const newRecipeId = response.data.id || response.data.receta.id;
        
        // Redirige a la página de edición de ingredientes con un mensaje de éxito.
        navigate(`/recetas/${newRecipeId}/editar-ingredientes`, {
          state: { message: '¡Receta creada exitosamente! Ahora añade los ingredientes.' }
        });

      } else {
        alert('Receta creada, pero no se pudo redirigir automáticamente.');
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocurrió un error al crear la receta.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe-container">
      <form onSubmit={handleSubmit} className="create-recipe-form">
        <h1>Paso 1: Detalles de la Receta</h1>
        {error && <div className="error-message">{error}</div>}
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
                <input type="text" value={paso} onChange={(e) => handlePasoChange(index, e.target.value)} placeholder={`Describe el paso ${index + 1}`} />
                <button type="button" onClick={() => eliminarPaso(index)} className="eliminar-paso-btn">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={agregarPaso} className="agregar-paso-btn">+ Añadir otro paso</button>
        </div>
        <div className="form-group">
          <label htmlFor="tiempo_preparacion">Tiempo de Preparación (minutos)</label>
          <input id="tiempo_preparacion" type="number" min="1" value={tiempo_preparacion} onChange={(e) => setTiempoPreparacion(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="dificultad">Dificultad</label>
          <select id="dificultad" value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
            <option value="Fácil">Fácil</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Siguiente: Añadir Ingredientes'}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipePage;