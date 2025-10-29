/**
 * @fileoverview Componente de barra de búsqueda con resultados desplegables en tiempo real.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza una barra de búsqueda que, mientras el usuario escribe,
 * realiza peticiones a la API (con un retardo o "debounce") para mostrar sugerencias.
 * También permite una búsqueda completa al enviar el formulario.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import './SearchBar.css';

/**
 * Componente funcional que proporciona una interfaz de búsqueda.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {Function} props.onSearchSubmit - Callback que se ejecuta cuando se envía el formulario de búsqueda. Pasa el término de búsqueda al componente padre.
 * @returns {JSX.Element} El componente de la barra de búsqueda.
 */
const SearchBar = ({ onSearchSubmit }) => {
  // --- ESTADOS DEL COMPONENTE ---
  const [query, setQuery] = useState(''); // El texto actual en el campo de búsqueda.
  const [results, setResults] = useState([]); // Los resultados obtenidos de la API.
  const [loading, setLoading] = useState(false); // Indica si se está realizando una búsqueda.
  const [showResults, setShowResults] = useState(false); // Controla la visibilidad del desplegable de resultados.

  // --- HOOKS ---
  const searchRef = useRef(null); // Referencia al contenedor principal para detectar clics fuera.
  const navigate = useNavigate();

  /**
   * Efecto que realiza la búsqueda a la API con "debouncing".
   * Espera 300ms después de que el usuario deja de escribir antes de enviar la petición,
   * para evitar un número excesivo de llamadas a la API.
   */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const debounceTimer = setTimeout(() => {
      apiClient.get(`/busqueda/general?termino=${query}`)
        .then(response => {
          if (Array.isArray(response.data.recetas)) {
            setResults(response.data.recetas);
          }
        })
        .catch(error => { console.error("Error en la búsqueda:", error); setResults([]); })
        .finally(() => { setLoading(false); });
    }, 300);
    // Limpia el temporizador si el usuario sigue escribiendo.
    return () => clearTimeout(debounceTimer);
  }, [query]);

  /**
   * Efecto para cerrar el desplegable de resultados si el usuario hace clic
   * fuera del contenedor de la barra de búsqueda.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [searchRef]);

  /**
   * Maneja los cambios en el campo de texto de búsqueda.
   * @param {React.ChangeEvent<HTMLInputElement>} e - El evento de cambio del input.
   */
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  /**
   * Maneja el envío del formulario de búsqueda.
   * Llama a la función `onSearchSubmit` del componente padre para que este
   * actualice la vista principal con los resultados de la búsqueda.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setShowResults(false);
    onSearchSubmit(query);
  };
  
  /**
   * Se ejecuta al hacer clic en un resultado del desplegable.
   * Oculta el desplegable y opcionalmente limpia la barra de búsqueda.
   */
  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
  };

  return (
    <form className="search-bar-container" ref={searchRef} onSubmit={handleFormSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Buscar recetas..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
      />
      <button type="submit" className="search-bar-button">Buscar</button>

      {showResults && (query.length > 1) && (
        <div className="search-results-dropdown">
          {loading && <div className="search-result-item">Buscando...</div>}
          {!loading && results.length === 0 && query.length > 1 && (
            <div className="search-result-item">No se encontraron resultados.</div>
          )}
          {!loading && results.map(recipe => (
            <Link
              to={`/recetas/${recipe.id}`}
              key={recipe.id}
              className="search-result-item"
              onClick={handleResultClick}
            >
              {recipe.titulo}
            </Link>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;