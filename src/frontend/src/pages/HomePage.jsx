/**
 * @fileoverview Página de inicio de GastroVerse.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente es la página principal de la aplicación. Muestra una sección
 * de bienvenida, controles de búsqueda y filtrado, una sección de recetas populares,
 * y una cuadrícula con todas las recetas o los resultados de la búsqueda/filtro.
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import RecipeCard from '../components/common/RecipeCard';
import FilterControls from '../components/common/FilterControls';
import SearchBar from '../components/common/SearchBar';
import PopularRecipes from '../components/common/PopularRecipes';
import './HomePage.css';

/**
 * Componente funcional que renderiza la página de inicio.
 * @returns {JSX.Element} La página de inicio.
 */
const HomePage = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [allRecipes, setAllRecipes] = useState([]); // Almacena la lista completa de recetas original.
  const [displayedRecipes, setDisplayedRecipes] = useState([]); // Recetas que se muestran actualmente en la cuadrícula.
  const [gridLoading, setGridLoading] = useState(true); // Estado de carga para la cuadrícula de recetas.
  const [error, setError] = useState(null); // Almacena mensajes de error de la API.
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // Término de búsqueda activo.
  const [activeFilters, setActiveFilters] = useState({}); // Filtros activos.

  /**
   * Obtiene la lista completa de recetas de la API al cargar la página.
   * @async
   */
  const fetchAllRecipes = useCallback(async () => {
    setGridLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/recetas');
      if (Array.isArray(response.data)) {
        setAllRecipes(response.data);
        setDisplayedRecipes(response.data);
      } else {
        setAllRecipes([]);
        setDisplayedRecipes([]);
      }
    } catch (err) {
      setError('No se pudieron cargar las recetas.');
    } finally {
      setGridLoading(false);
    }
  }, []);

  /**
   * Efecto que llama a `fetchAllRecipes` una vez cuando el componente se monta.
   */
  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  /**
   * Realiza una búsqueda general en la API con un término específico.
   * @param {string} searchTerm - El término a buscar.
   * @async
   */
  const handleFullSearch = async (searchTerm) => {
    setGridLoading(true);
    setError(null);
    setActiveSearchTerm(searchTerm);
    setActiveFilters({}); // Resetea los filtros al hacer una nueva búsqueda.
    try {
      const response = await apiClient.get(`/busqueda/general?termino=${searchTerm}`);
      if (Array.isArray(response.data.recetas)) {
        setDisplayedRecipes(response.data.recetas);
      } else {
        setDisplayedRecipes([]);
      }
    } catch (err) {
      setError('Error al buscar recetas.');
      setDisplayedRecipes([]);
    } finally {
      setGridLoading(false);
    }
  };

  /**
   * Aplica filtros a la lista de recetas llamando a la API.
   * @param {object} filters - Un objeto con los filtros a aplicar (ej. { dificultad: 'Fácil' }).
   * @async
   */
  const handleFilter = async (filters) => {
    if (Object.keys(filters).length === 0) return;
    setGridLoading(true);
    setError(null);
    setActiveFilters(filters);
    setActiveSearchTerm(''); // Resetea la búsqueda al aplicar filtros.
    try {
      const params = new URLSearchParams(filters);
      const response = await apiClient.get(`/busqueda/filtrar?${params.toString()}`);
      if (Array.isArray(response.data)) {
        setDisplayedRecipes(response.data);
      } else {
        setDisplayedRecipes([]);
      }
    } catch (err) {
      setError('Error al filtrar las recetas.');
      setDisplayedRecipes([]);
    } finally {
      setGridLoading(false);
    }
  };
  
  /**
   * Resetea la vista para mostrar de nuevo todas las recetas.
   * Limpia los términos de búsqueda y los filtros activos.
   */
  const handleReset = () => {
    setDisplayedRecipes(allRecipes);
    setActiveSearchTerm('');
    setActiveFilters({});
  };

  /**
   * Genera un mensaje informativo para el usuario sobre el estado actual de la vista.
   * @returns {string|null} El mensaje a mostrar, o null si no hay búsqueda ni filtro.
   */
  const getDisplayMessage = () => {
    if (activeSearchTerm) return `Mostrando resultados para "${activeSearchTerm}".`;
    if (Object.keys(activeFilters).length > 0) return `Mostrando resultados filtrados.`;
    return null;
  };

  const displayMessage = getDisplayMessage();

  return (
    <div className="homepage-container main-container">
      <div className="hero-section">
        <h1>Descubre Nuevas Recetas</h1>
        <p className="slogan">"Donde cada receta tiene su Universo"</p>
      </div>
      
      <div className="search-section">
        <SearchBar onSearchSubmit={handleFullSearch} />
      </div>

      <FilterControls onFilterChange={handleFilter} onReset={handleReset} />
      
      {displayMessage && (
        <p className="filter-info">
          {displayMessage} <button onClick={handleReset}>Ver todas</button>
        </p>
      )}

      {/* Renderizado condicional: solo muestra Populares si no hay búsqueda o filtro activo. */}
      {!activeSearchTerm && Object.keys(activeFilters).length === 0 && (
        <PopularRecipes />
      )}

      <div className="main-grid-section">
        {/* Renderizado condicional: solo muestra el título "Todas las Recetas" en la vista por defecto. */}
        {!activeSearchTerm && Object.keys(activeFilters).length === 0 && (
          <h2 className="all-recipes-title">Todas las Recetas</h2>
        )}

        {gridLoading ? (
          <div className="status-message">Cargando...</div>
        ) : error ? (
          <div className="status-message error">{error}</div>
        ) : (
          <div className="recipes-grid">
            {displayedRecipes.length > 0 ? (
              displayedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <p>
                {activeSearchTerm || Object.keys(activeFilters).length > 0
                  ? "No se encontraron recetas que coincidan con tu criterio." 
                  : "No hay recetas disponibles en este momento."
                }
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;