/**
 * @fileoverview Servicio de búsqueda y filtrado de recetas (Optimizado)
 * @version 2.0.0
 * @description Búsqueda flexible, tolerante y con coincidencias parciales
 */

const RecetasPopularesModel = require('../models/vistas/recetasPopularesModel');
const RecetasConIngredientesModel = require('../models/vistas/recetasConIngredientesModel');
const BusquedaTextoModel = require('../models/busquedaTextoModel');

// 🔥 Normalizador para búsquedas
const normalize = (str = '') =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos

const BusquedaService = {

  async obtenerRecetasPopulares(limit = 10) {
    return await RecetasPopularesModel.obtenerRecetasPopulares(limit);
  },

  async buscarPorIngrediente(ingrediente) {
    const ingredienteLimpio = normalize(ingrediente);
    if (!ingredienteLimpio) throw new Error('Ingrediente inválido');

    try {
      return await RecetasConIngredientesModel.buscarPorIngrediente(ingredienteLimpio);
    } catch (error) {
      console.error('Error en búsqueda por ingrediente:', error);
      throw new Error('Error en la búsqueda por ingrediente');
    }
  },

  async filtrarRecetas(filtros = {}) {
    const { dificultad, tiempo_max, ingrediente } = filtros;

    if (!dificultad && !tiempo_max && !ingrediente) {
      return await RecetasConIngredientesModel.obtenerTodasConIngredientes();
    }

    let recetas = ingrediente
      ? await RecetasConIngredientesModel.buscarPorIngrediente(normalize(ingrediente))
      : await RecetasConIngredientesModel.obtenerTodasConIngredientes();

    if (dificultad) recetas = recetas.filter(r => normalize(r.dificultad) === normalize(dificultad));
    if (tiempo_max) recetas = recetas.filter(r => r.tiempo_preparacion <= tiempo_max);

    return recetas;
  },

  /** Búsqueda por título con tolerancia y coincidencias parciales */
  async buscarRecetasPorTitulo(termino) {
    const term = normalize(termino);
    if (!term) throw new Error('Debe ingresar un término de búsqueda');

    try {
      return await BusquedaTextoModel.buscarRecetasPorTitulo(term);
    } catch (error) {
      console.error('Error en búsqueda por título:', error);
      throw new Error('Error en la búsqueda por título');
    }
  },

  /** Búsqueda general mejorada con coincidencias múltiples */
  async busquedaGeneral(termino) {
    const term = normalize(termino);
    if (!term) throw new Error('Debe ingresar un término de búsqueda');

    // Permite búsquedas por varias palabras: "po po" = pollo poblano
    const palabras = term.split(" ");

    try {
      let resultados = await BusquedaTextoModel.busquedaGeneral(term);

      // Filtro extra para mayor precisión
      resultados = resultados.filter(r => {
        const tituloNorm = normalize(r.titulo);
        return palabras.every(p => tituloNorm.includes(p));
      });

      return resultados;
    } catch (error) {
      console.error('Error en búsqueda general:', error);
      throw new Error('Error en la búsqueda general');
    }
  }
};

module.exports = BusquedaService;
