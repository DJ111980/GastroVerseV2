/**
 * @fileoverview Componente reutilizable con controles para filtrar recetas.
 * @author Ronald Niño
 * @version 1.0.0
 * @description Este componente renderiza un conjunto de campos de formulario (select, input)
 * que permiten al usuario filtrar recetas por criterios como dificultad y tiempo.
 * Es un componente controlado que comunica los cambios a su componente padre.
 */

import React, { useState } from 'react';
import './FilterControls.css';

/**
 * Componente funcional que muestra los controles de filtro.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {Function} props.onFilterChange - Callback que se ejecuta al aplicar los filtros. Devuelve un objeto con los filtros activos.
 * @param {Function} props.onReset - Callback que se ejecuta al limpiar los filtros.
 * @returns {JSX.Element} El componente de controles de filtro.
 */
const FilterControls = ({ onFilterChange, onReset }) => {
  // --- ESTADOS INTERNOS DEL COMPONENTE ---
  const [dificultad, setDificultad] = useState('');
  const [tiempoMax, setTiempoMax] = useState('');

  /**
   * Se ejecuta cuando el usuario hace clic en "Aplicar Filtros".
   * Construye un objeto con solo los filtros que tienen un valor seleccionado
   * y lo pasa al componente padre a través de la prop `onFilterChange`.
   */
  const handleApplyFilters = () => {
    const activeFilters = {};
    if (dificultad) activeFilters.dificultad = dificultad;
    if (tiempoMax) activeFilters.tiempo_max = tiempoMax;

    onFilterChange(activeFilters);
  };
  
  /**
   * Se ejecuta cuando el usuario hace clic en "Limpiar".
   * Resetea los estados internos de los campos del formulario y llama
   * a la función `onReset` del componente padre.
   */
  const handleResetFilters = () => {
    setDificultad('');
    setTiempoMax('');
    onReset();
  };

  return (
    <div className="filter-controls">
      <div className="filter-group">
        <label htmlFor="dificultad">Dificultad</label>
        <select
          id="dificultad"
          value={dificultad}
          onChange={(e) => setDificultad(e.target.value)}
          className="select-dificultad"
        >
          <option value="">Cualquiera</option>
          <option value="Fácil">Fácil</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Difícil">Difícil</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="tiempo_max">Tiempo Máx. (min)</label>
        <input
          id="tiempo_max"
          type="number"
          placeholder="Ej: 60"
          value={tiempoMax}
          onChange={(e) => setTiempoMax(e.target.value)}
          min="1"
        />
      </div>

      <div className="filter-actions">
        <button onClick={handleApplyFilters} className="filter-button apply">
          Aplicar Filtros
        </button>
        <button onClick={handleResetFilters} className="filter-button reset">
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default FilterControls;