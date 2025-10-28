/**
 * @fileoverview Servicio de búsqueda y filtrado de recetas
 * @author Danilo
 * @version 1.0.0
 * @description Lógica de negocio para diferentes tipos de búsqueda
 */

const RecetasPopularesModel = require('../models/vistas/recetasPopularesModel');
const RecetasConIngredientesModel = require('../models/vistas/recetasConIngredientesModel');
const BusquedaTextoModel = require('../models/busquedaTextoModel');

const BusquedaService = {
  /**
   * Obtener recetas más populares ordenadas por favoritos
   * @param {number} limit - Límite de resultados (default: 10)
   * @returns {Array} Lista de recetas populares
   */
  async obtenerRecetasPopulares(limit = 10) {
    return await RecetasPopularesModel.obtenerRecetasPopulares(limit);
  },

  /**
   * Buscar recetas que contengan un ingrediente específico
   * @param {string} ingrediente - Nombre del ingrediente a buscar
   * @returns {Array} Recetas que contienen el ingrediente
   */
  async buscarPorIngrediente(ingrediente) {
    if (!ingrediente || typeof ingrediente !== 'string') {
      throw new Error('El ingrediente debe ser una cadena de texto válida');
    }
    
    const ingredienteLimpio = ingrediente.trim();
    if (ingredienteLimpio.length < 2) {
      throw new Error('El ingrediente debe tener al menos 2 caracteres');
    }
    
    try {
      return await RecetasConIngredientesModel.buscarPorIngrediente(ingredienteLimpio);
    } catch (error) {
      console.error('Error en búsqueda por ingrediente:', error);
      throw new Error('Error en la búsqueda por ingrediente');
    }
  },

  /**
   * Filtrar recetas por múltiples criterios
   * Combina filtros de dificultad, tiempo y ingrediente
   * @param {Object} filtros - Objeto con criterios de filtrado
   * @returns {Array} Recetas filtradas
   */
  async filtrarRecetas(filtros = {}) {
    const { dificultad, tiempo_max, ingrediente } = filtros;

    // Si no hay filtros, devolver todas las recetas
    if (!dificultad && !tiempo_max && !ingrediente) {
      return await RecetasConIngredientesModel.obtenerTodasConIngredientes();
    }

    let recetas = [];

    // Aplicar filtro de ingrediente primero si existe
    if (ingrediente) {
      recetas = await RecetasConIngredientesModel.buscarPorIngrediente(ingrediente);
    } else {
      recetas = await RecetasConIngredientesModel.obtenerTodasConIngredientes();
    }

    // Aplicar filtro de dificultad
    if (dificultad && ingrediente) {
      recetas = recetas.filter(r => r.dificultad === dificultad);
    } else if (dificultad && !ingrediente) {
      recetas = await RecetasConIngredientesModel.filtrarPorDificultad(dificultad);
    }

    // Aplicar filtro de tiempo máximo
    if (tiempo_max) {
      if (ingrediente || dificultad) {
        recetas = recetas.filter(r => r.tiempo_preparacion <= tiempo_max);
      } else {
        recetas = await RecetasConIngredientesModel.filtrarPorTiempo(tiempo_max);
      }
    }

    return recetas;
  },

  /**
   * Buscar recetas por título usando coincidencias parciales
   * @param {string} termino - Término de búsqueda
   * @returns {Array} Recetas con títulos coincidentes
   */
  async buscarRecetasPorTitulo(termino) {
    if (!termino || typeof termino !== 'string') {
      throw new Error('El término de búsqueda debe ser una cadena de texto válida');
    }
    
    const terminoLimpio = termino.trim();
    if (terminoLimpio.length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }
    
    try {
      return await BusquedaTextoModel.buscarRecetasPorTitulo(terminoLimpio);
    } catch (error) {
      console.error('Error en búsqueda por título:', error);
      throw new Error('Error en la búsqueda por título');
    }
  },

  /**
   * Búsqueda general en títulos e ingredientes
   * Busca en múltiples campos para mayor cobertura
   * @param {string} termino - Término de búsqueda general
   * @returns {Array} Recetas que coinciden en título o ingredientes
   */
  async busquedaGeneral(termino) {
    if (!termino || typeof termino !== 'string') {
      throw new Error('El término de búsqueda debe ser una cadena de texto válida');
    }
    
    const terminoLimpio = termino.trim();
    if (terminoLimpio.length < 2) {
      throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
    }
    
    try {
      return await BusquedaTextoModel.busquedaGeneral(terminoLimpio);
    } catch (error) {
      console.error('Error en búsqueda general:', error);
      throw new Error('Error en la búsqueda general');
    }
  }
};

module.exports = BusquedaService;