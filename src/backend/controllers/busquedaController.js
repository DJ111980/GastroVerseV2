/**
 * @fileoverview Controlador para operaciones de búsqueda de recetas
 * @author Danilo
 * @version 1.0.0
 * @description Maneja todos los endpoints relacionados con búsqueda y filtrado de recetas
 */

const BusquedaService = require('../services/busquedaService');

/**
 * Controlador principal para búsquedas de recetas
 * Implementa el patrón MVC - capa de controlador
 */
const BusquedaController = {
  /**
   * Obtiene las recetas más populares (con más favoritos)
   * @param {Object} req - Objeto request de Express
   * @param {Object} res - Objeto response de Express
   * @returns {Promise<void>} JSON con array de recetas populares
   */
  async obtenerRecetasPopulares(req, res) {
    try {
      // Parseo seguro del límite con valor por defecto
      const limit = parseInt(req.query.limit) || 10;
      
      // Delegación a la capa de servicio
      const recetas = await BusquedaService.obtenerRecetasPopulares(limit);
      
      res.json(recetas);
    } catch (error) {
      // Manejo centralizado de errores - devuelve 500 por defecto
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Busca recetas que contengan un ingrediente específico
   * @param {Object} req - Request con query param 'ingrediente'
   * @param {Object} res - Response object
   * @returns {Promise<void>} Array de recetas que contienen el ingrediente
   */
  async buscarPorIngrediente(req, res) {
    try {
      const { ingrediente } = req.query;
      
      // Validación de entrada obligatoria
      if (!ingrediente) {
        return res.status(400).json({ error: 'Parámetro ingrediente es requerido' });
      }

      const recetas = await BusquedaService.buscarPorIngrediente(ingrediente);
      res.json(recetas);
    } catch (error) {
      // Error 400 para problemas de datos de entrada
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Aplica múltiples filtros a las recetas (dificultad, tiempo, etc.)
   * @param {Object} req - Request con query params como filtros
   * @param {Object} res - Response object
   * @returns {Promise<void>} Recetas filtradas según criterios
   */
  async filtrarRecetas(req, res) {
    try {
      // Pasa todos los query params como filtros al servicio
      const filtros = req.query;
      const recetas = await BusquedaService.filtrarRecetas(filtros);
      res.json(recetas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Busca recetas por coincidencia en el título
   * @param {Object} req - Request con query param 'termino'
   * @param {Object} res - Response object
   * @returns {Promise<void>} Recetas con título que coincide con el término
   */
  async buscarPorTitulo(req, res) {
    try {
      const { termino } = req.query;
      
      // Validación: término de búsqueda obligatorio
      if (!termino) {
        return res.status(400).json({ error: 'Parámetro termino es requerido' });
      }

      const recetas = await BusquedaService.buscarRecetasPorTitulo(termino);
      
      // Respuesta enriquecida con metadata de búsqueda
      res.json({
        mensaje: `Búsqueda por título: "${termino}"`,
        total: recetas.length,
        recetas
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Búsqueda general que abarca títulos e ingredientes
   * @param {Object} req - Request con query param 'termino'
   * @param {Object} res - Response object
   * @returns {Promise<void>} Recetas que coinciden en título o ingredientes
   */
  async busquedaGeneral(req, res) {
    try {
      const { termino } = req.query;
      
      // Validación de entrada
      if (!termino) {
        return res.status(400).json({ error: 'Parámetro termino es requerido' });
      }

      const recetas = await BusquedaService.busquedaGeneral(termino);
      
      // Respuesta con contexto de búsqueda
      res.json({
        mensaje: `Búsqueda general: "${termino}"`,
        total: recetas.length,
        recetas
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = BusquedaController;