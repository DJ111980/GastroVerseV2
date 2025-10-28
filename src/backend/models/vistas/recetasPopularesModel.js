/**
 * @fileoverview Modelo para acceso a vista de recetas populares
 * @author Danilo
 * @version 1.0.0
 * @description Gestiona consultas a recetas ordenadas por popularidad (favoritos)
 */

const database = require('../../config/database');

/**
 * Modelo para operaciones con vista recetas_populares
 * Utiliza vista pre-calculada para optimizar consultas de popularidad
 * @namespace RecetasPopularesModel
 */
const RecetasPopularesModel = {
  /**
   * Obtiene las recetas más populares limitadas por cantidad
   * Ordenadas por número de favoritos descendente
   * @param {number} [limit=10] - Cantidad máxima de recetas a retornar
   * @returns {Promise<Array>} Array de recetas populares con conteo de favoritos
   */
  async obtenerRecetasPopulares(limit = 10) {
    const query = `
      SELECT * FROM recetas_populares 
      LIMIT $1;
    `;
    const result = await database.query(query, [limit]);
    return result.rows;
  },

  /**
   * Obtiene una receta popular específica por ID
   * Incluye información de popularidad (conteo de favoritos)
   * @param {number} id - ID único de la receta
   * @returns {Promise<Object|undefined>} Objeto receta popular o undefined si no existe
   */
  async obtenerRecetaPopularPorId(id) {
    const query = `
      SELECT * FROM recetas_populares 
      WHERE id = $1;
    `;
    const result = await database.query(query, [id]);
    return result.rows[0]; // Retorna undefined si no encuentra nada
  }
};

/**
 * Exportación del modelo para uso en servicios
 * Especializado en consultas de popularidad y rankings
 */
module.exports = RecetasPopularesModel;