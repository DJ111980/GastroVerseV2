/**
 * @fileoverview Modelo para interacción con vista recetas_con_ingredientes
 * @author Danilo
 * @version 1.0.0
 * @description Acceso a datos de recetas con ingredientes concatenados para búsquedas
 */

const database = require('../../config/database');

/**
 * Modelo para operaciones con la vista recetas_con_ingredientes
 * Facilita búsquedas y filtros sin hacer JOINs complejos en cada query
 * @namespace RecetasConIngredientesModel
 */
const RecetasConIngredientesModel = {
  /**
   * Busca recetas que contengan un ingrediente específico
   * Utiliza ILIKE para búsqueda insensible a mayúsculas
   * @param {string} ingrediente - Nombre del ingrediente a buscar
   * @returns {Promise<Array>} Array de recetas que contienen el ingrediente
   */
  async buscarPorIngrediente(ingrediente) {
    const query = `
      SELECT * FROM recetas_con_ingredientes 
      WHERE ingredientes ILIKE $1;
    `;
    const result = await database.query(query, [`%${ingrediente}%`]);
    return result.rows;
  },

  /**
   * Obtiene todas las recetas con sus ingredientes concatenados
   * Ordenadas alfabéticamente por título para consistencia
   * @returns {Promise<Array>} Array de todas las recetas con ingredientes
   */
  async obtenerTodasConIngredientes() {
    const query = `SELECT * FROM recetas_con_ingredientes ORDER BY titulo;`;
    const result = await database.query(query);
    return result.rows;
  },

  /**
   * Filtra recetas por nivel de dificultad
   * @param {string} dificultad - Nivel: "Fácil", "Intermedio" o "Difícil"
   * @returns {Promise<Array>} Array de recetas filtradas por dificultad
   */
  async filtrarPorDificultad(dificultad) {
    const query = `
      SELECT * FROM recetas_con_ingredientes 
      WHERE dificultad = $1;
    `;
    const result = await database.query(query, [dificultad]);
    return result.rows;
  },

  /**
   * Filtra recetas por tiempo máximo de preparación
   * Ordenadas por tiempo ascendente (más rápidas primero)
   * @param {number} tiempo_max - Tiempo máximo en minutos
   * @returns {Promise<Array>} Array de recetas que se pueden hacer en el tiempo dado
   */
  async filtrarPorTiempo(tiempo_max) {
    const query = `
      SELECT * FROM recetas_con_ingredientes 
      WHERE tiempo_preparacion <= $1
      ORDER BY tiempo_preparacion ASC;
    `;
    const result = await database.query(query, [tiempo_max]);
    return result.rows;
  }
};

/**
 * Exportación del modelo para uso en servicios
 * Encapsula lógica de acceso a datos de la vista
 */
module.exports = RecetasConIngredientesModel;