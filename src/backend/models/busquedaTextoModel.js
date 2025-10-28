/**
 * @fileoverview Modelo para búsquedas de texto completo con PostgreSQL
 * @author Danilo
 * @version 1.0.0
 * @description Implementa búsquedas inteligentes usando tsvector y ranking de relevancia
 */

const database = require('../config/database');

/**
 * Modelo especializado en búsquedas de texto completo
 * Utiliza capacidades nativas de PostgreSQL para búsqueda en español
 * @namespace BusquedaTextoModel
 */
const BusquedaTextoModel = {
  /**
   * Busca recetas por título usando búsqueda de texto completo
   * Incluye ranking de relevancia para ordenar resultados
   * @param {string} termino - Término de búsqueda en español
   * @returns {Promise<Array>} Array de recetas ordenadas por relevancia
   */
  async buscarRecetasPorTitulo(termino) {
    const query = `
      SELECT r.*, 
             ts_rank(to_tsvector('spanish', titulo), plainto_tsquery('spanish', $1)) as relevancia
      FROM recetas r
      WHERE to_tsvector('spanish', titulo) @@ plainto_tsquery('spanish', $1)
      ORDER BY relevancia DESC;
    `;
    const result = await database.query(query, [termino]);
    return result.rows;
  },

  /**
   * Búsqueda general en títulos e ingredientes
   * Combina resultados de múltiples campos con UNION ALL
   * @param {string} termino - Término de búsqueda para títulos e ingredientes
   * @returns {Promise<Array>} Array de recetas con tipo de coincidencia y relevancia
   */
  async busquedaGeneral(termino) {
    const query = `
      SELECT DISTINCT r.*, 'titulo' as tipo_coincidencia,
             ts_rank(to_tsvector('spanish', r.titulo), plainto_tsquery('spanish', $1)) as relevancia
      FROM recetas r
      WHERE to_tsvector('spanish', r.titulo) @@ plainto_tsquery('spanish', $1)
      
      UNION ALL
      
      SELECT DISTINCT r.*, 'ingrediente' as tipo_coincidencia,
             ts_rank(to_tsvector('spanish', i.nombre), plainto_tsquery('spanish', $1)) as relevancia
      FROM recetas r
      JOIN ingredientes i ON r.id = i.receta_id
      WHERE to_tsvector('spanish', i.nombre) @@ plainto_tsquery('spanish', $1)
      
      ORDER BY relevancia DESC;
    `;
    const result = await database.query(query, [termino]);
    return result.rows;
  }
};

/**
 * Exportación del modelo para servicios de búsqueda
 * Aprovecha índices de texto completo para búsquedas eficientes
 */
module.exports = BusquedaTextoModel;