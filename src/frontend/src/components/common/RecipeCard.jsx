import React from 'react';
import { Link } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onRemoveFavorite, isFavoritePage = false }) => {
  const recipeId = recipe.id || recipe.receta_id;
  const imageUrl = recipe["imagen_url"]; // ⬅️ URL proveniente de BD

  return (
    <Link to={`/recetas/${recipeId}`} className="recipe-card">
      
      {/* Imagen de la receta (si existe) */}
      {imageUrl && (
        <img 
          src={imageUrl}
          alt={recipe.titulo}
          className="recipe-card-image"
        />
      )}

      <div className="recipe-card-content">
        <h3>{recipe.titulo}</h3>
        <div className="recipe-card-details">
          <span>Dificultad: {recipe.dificultad || 'No especificada'}</span>
          <span>Tiempo: {recipe.tiempo_preparacion || '?'} min</span>
        </div>
      </div>
      
      {isFavoritePage && (
        <div className="recipe-card-actions">
          <button 
            onClick={(e) => {
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
