/**
 * @fileoverview Página que muestra las recetas favoritas de un usuario.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente obtiene y renderiza una lista de las recetas que el
 * usuario ha marcado como favoritas. Permite también eliminar recetas de esta lista.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import RecipeCard from '../components/common/RecipeCard';
import './FavoritesPage.css';

/**
 * Componente funcional que representa la página de recetas favoritas.
 * @returns {JSX.Element} La página de favoritos.
 */
const FavoritesPage = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Función para obtener la lista de recetas favoritas del usuario desde la API.
   * Se utiliza `useCallback` para memorizar la función y evitar re-creaciones.
   * @async
   */
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/favoritos');
      
      // Verifica que la respuesta de la API sea un array.
      if (Array.isArray(response.data)) {
        setFavorites(response.data);
      } else {
        console.warn("La respuesta de favoritos no es un array:", response.data);
        setFavorites([]); // Asegura que el estado sea un array vacío si la respuesta es inválida.
      }
    } catch (err) {
      console.error("Error al cargar favoritos:", err);
      setError('No se pudieron cargar tus favoritos.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Efecto que llama a `fetchFavorites` cuando el componente se monta.
   */
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  /**
   * Maneja la eliminación de una receta de la lista de favoritos.
   * Realiza una "actualización optimista": elimina el elemento de la UI inmediatamente
   * y luego envía la petición a la API. Si la API falla, revierte el cambio en la UI.
   * @param {number} recipeIdToRemove - El ID de la receta a eliminar de favoritos.
   * @async
   */
  const handleRemoveFavorite = async (recipeIdToRemove) => {
    const originalFavorites = [...favorites];
    
    // Actualización optimista de la UI.
    setFavorites(currentFavorites =>
      currentFavorites.filter(fav => fav.id !== recipeIdToRemove)
    );

    try {
      // El endpoint de DELETE espera el ID de la receta.
      await apiClient.delete(`/favoritos/${recipeIdToRemove}`);
    } catch (err) {
      alert('No se pudo quitar de favoritos. Por favor, inténtalo de nuevo.');
      // Si la petición falla, se revierte el estado de la UI al original.
      setFavorites(originalFavorites);
    }
  };

  if (loading) return <div className="status-message">Cargando tus favoritos...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="favorites-container main-container">
      <div className="favorites-header">
        <h1>Mis Recetas Favoritas</h1>
        <p>Tu colección personal de las mejores recetas.</p>
      </div>

      {favorites.length > 0 ? (
        <div className="recipes-grid">
          {favorites.map(favorite => (
            <RecipeCard
              key={favorite.id}
              recipe={favorite}
              isFavoritePage={true}
              onRemoveFavorite={() => handleRemoveFavorite(favorite.id)}
            />
          ))}
        </div>
      ) : (
        <div className="no-favorites-message">
          <p>Aún no has añadido ninguna receta a tus favoritos.</p>
          <Link to="/" className="find-recipes-link">
            Descubrir Recetas
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;