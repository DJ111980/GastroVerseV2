/**
 * @fileoverview Página que muestra las recetas creadas por el usuario autenticado.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente obtiene y renderiza una lista de las recetas que el
 * usuario ha creado. Muestra un mensaje de bienvenida si la lista está vacía.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import RecipeCard from '../components/common/RecipeCard';
import './MyRecipesPage.css';

/**
 * Componente funcional que representa la página "Mis Recetas".
 * @returns {JSX.Element} La página con la lista de recetas del usuario.
 */
const MyRecipesPage = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Efecto que se ejecuta una vez al montar el componente para obtener las recetas
   * del usuario desde la API.
   */
  useEffect(() => {
    /**
     * Función asíncrona para realizar la llamada a la API.
     * @async
     */
    const fetchMyRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Llama al endpoint protegido para obtener las recetas del usuario.
        const response = await apiClient.get('/recetas/misRecetas');
        
        // Valida que la respuesta de la API tenga el formato esperado.
        if (response.data && Array.isArray(response.data.recetas)) {
          setMyRecipes(response.data.recetas);
        } else {
          console.error("Formato de respuesta inesperado:", response.data);
          setMyRecipes([]);
        }
      } catch (err) {
        console.error("Error al obtener mis recetas:", err);
        setError('No se pudieron cargar tus recetas. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez.

  if (loading) {
    return <div className="status-message">Cargando tus recetas...</div>;
  }

  if (error) {
    return <div className="status-message error">{error}</div>;
  }

  return (
    <div className="my-recipes-container main-container">
      <div className="my-recipes-header">
        <h1>Mis Recetas</h1>
        <p>Aquí encontrarás todas las recetas que has creado y compartido.</p>
      </div>

      {/* Renderizado condicional: muestra la cuadrícula de recetas o un mensaje si no hay ninguna. */}
      {myRecipes.length > 0 ? (
        <div className="recipes-grid">
          {myRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="no-recipes-message">
          <p>Aún no has creado ninguna receta.</p>
          <Link to="/recetas/crear" className="create-recipe-link">
            ¡Crea tu primera receta ahora!
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;