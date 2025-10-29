/**
 * @fileoverview Componente para mostrar una sección de recetas populares.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente obtiene y renderiza una lista de las recetas más
 * populares (ej. las más guardadas en favoritos) desde la API. Está diseñado
 * para ser un "widget" en la página de inicio.
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import RecipeCard from './RecipeCard';
import './PopularRecipes.css';

/**
 * Componente funcional que renderiza la sección de recetas populares.
 * @returns {JSX.Element|null} La sección de recetas populares, o null si no hay datos o hay un error.
 */
const PopularRecipes = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Efecto que se ejecuta una vez al montar el componente para obtener
   * las recetas populares desde la API.
   */
  useEffect(() => {
    /**
     * Función asíncrona para realizar la llamada a la API.
     * @async
     */
    const fetchPopularRecipes = async () => {
      try {
        // Llama al endpoint de búsqueda de populares, limitando los resultados a 5.
        const response = await apiClient.get('/busqueda/populares?limit=5');
        
        // Valida que la respuesta de la API sea un array.
        if (Array.isArray(response.data)) {
          setPopularRecipes(response.data);
        } else {
          // Si la respuesta tiene otra estructura (ej. { recetas: [...] }), se debe ajustar aquí.
          console.warn("La respuesta de recetas populares no es un array:", response.data);
          setPopularRecipes([]);
        }
      } catch (err) {
        console.error("Error al cargar las recetas populares:", err);
        setError("No se pudieron cargar las recetas populares.");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRecipes();
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez.

  /**
   * Renderizado condicional mientras se cargan los datos.
   */
  if (loading) return <div className="status-message">Cargando recetas populares...</div>;

  /**
   * Si hubo un error o no se encontraron recetas populares, no se renderiza nada
   * para no ocupar espacio innecesario en la página principal.
   */
  if (error || popularRecipes.length === 0) {
    return null;
  }

  return (
    <section className="popular-recipes-section">
      <h2>⭐ Recetas Populares</h2>
      <div className="recipes-grid">
        {popularRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
};

export default PopularRecipes;