/**
 * SearchBar optimizado para coincidencias parciales y búsqueda flexible
 * @version 1.2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import './SearchBar.css';

const SearchBar = ({ onSearchSubmit }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const term = query.toLowerCase(); // 🔥 Normaliza búsqueda

    setLoading(true);
    const delay = setTimeout(() => {
      apiClient
        .get(`/busqueda/general?termino=${term}`)
        .then((res) => {
          let recetas = res.data?.recetas || [];

          // 🔥 Mejora: coincidencias parciales incluso si el API devuelve poco
          recetas = recetas.filter(r =>
            r.titulo.toLowerCase().includes(term)
          );

          setResults(recetas.slice(0, 8)); // limitar a 8 sugerencias
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowResults(false);
    onSearchSubmit(query);
  };

  return (
    <form
      className="search-bar-container"
      ref={searchRef}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="search-bar-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar recetas..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
        <button type="submit" className="search-bar-button">Buscar</button>
      </div>

      {showResults && query.length >= 1 && (
        <div className="search-results-dropdown">
          {loading && <div className="search-result-item">Buscando...</div>}

          {!loading && results.length === 0 && (
            <div className="search-result-item">No se encontraron resultados</div>
          )}

          {!loading && results.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recetas/${recipe.id}`}
              className="search-result-item"
              onClick={() => setShowResults(false)}
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
