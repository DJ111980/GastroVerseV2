/**
 * @fileoverview Componente reutilizable para mostrar una tarjeta de receta.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza una tarjeta con un resumen de una receta.
 * Es interactivo, permitiendo hacer clic para ver los detalles. Opcionalmente,
 * puede mostrar un botón para eliminar la receta de favoritos.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './RecipeCard.css';

/**
 * Componente funcional que muestra una tarjeta de receta.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {object} props.recipe - El objeto de la receta a mostrar. Debe contener `id`, `titulo`, `dificultad`, etc.
 * @param {Function} [props.onRemoveFavorite] - Callback opcional que se ejecuta al hacer clic en el botón "Quitar de Favoritos".
 * @param {boolean} [props.isFavoritePage=false] - Booleano opcional que indica si la tarjeta se está renderizando en la página de favoritos.
 * @returns {JSX.Element} La tarjeta de receta.
 */
const RecipeCard = ({ recipe, onRemoveFavorite, isFavoritePage = false }) => {
  /**
   * El ID de la receta puede venir con diferentes nombres dependiendo del endpoint de la API.
   * Esta línea normaliza el ID para asegurar que siempre tengamos el valor correcto.
   * @type {number}
   */
  const recipeId = recipe.id || recipe.receta_id;

  return (
    // El contenedor principal es un enlace que navega a la página de detalles de la receta.
    <Link to={`/recetas/${recipeId}`} className="recipe-card">
      <div className="recipe-card-content">
        <h3>{recipe.titulo}</h3>
        <div className="recipe-card-details">
          <span>Dificultad: {recipe.dificultad || 'No especificada'}</span>
          <span>Tiempo: {recipe.tiempo_preparacion || '?'} min</span>
        </div>
      </div>
      
      {/**
       * Renderizado condicional de la sección de acciones.
       * El botón "Quitar de Favoritos" solo se muestra si la prop `isFavoritePage` es true.
       */}
      {isFavoritePage && (
        <div className="recipe-card-actions">
          <button 
            onClick={(e) => {
              // `e.preventDefault()` y `e.stopPropagation()` son cruciales aquí.
              // Evitan que el evento de clic en el botón también active la navegación
              // del componente <Link> padre.
              e.preventDefault();
              e.stopPropagation();
              onRemoveFavorite(recipeId);
            }} 
            className="remove-favorite-btn"
          >
            🗑️ Quitar de Favoritos
          </button>
        </div>
      )}
    </Link>
  );
};

export default RecipeCard;