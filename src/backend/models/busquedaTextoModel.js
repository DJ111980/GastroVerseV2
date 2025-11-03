/**
 * @fileoverview Modelo de búsqueda híbrida Full Text + Parcial + Sin acentos
 * @description Permite buscar con pocas letras, sin acentos y con ranking de relevancia
 */

const database = require('../config/database');

const BusquedaTextoModel = {

  /**
   * Búsqueda HÍBRIDA por título
   * - Full Text Search (relevancia)
   * - ILIKE parcial
   * - Normalize sin acentos
   */
  async buscarRecetasPorTitulo(termino) {
    const query = `
      SELECT DISTINCT r.*,
        'titulo' AS tipo_coincidencia,
        ts_rank(to_tsvector('spanish', unaccent(r.titulo)), plainto_tsquery('spanish', unaccent($1))) AS relevancia
      FROM recetas r
      WHERE 
        -- Full Text sin acentos
        to_tsvector('spanish', unaccent(r.titulo)) @@ plainto_tsquery('spanish', unaccent($1))
        OR unaccent(r.titulo) ILIKE unaccent('%' || $1 || '%')
      ORDER BY relevancia DESC NULLS LAST;
    `;
    const result = await database.query(query, [termino]);
    return result.rows;
  },

  /**
   * Búsqueda general HÍBRIDA:
   * Busca por título e ingredientes con:
   *  - Full Text Search
   *  - ILIKE parcial
   *  - Sin acentos
   */
  async busquedaGeneral(termino) {
    const query = `
      WITH resultados AS (
        -- Buscar por TÍTULO
        SELECT r.*, 'titulo' AS tipo_coincidencia,
          ts_rank(to_tsvector('spanish', unaccent(r.titulo)), plainto_tsquery('spanish', unaccent($1))) AS relevancia
        FROM recetas r
        WHERE 
          to_tsvector('spanish', unaccent(r.titulo)) @@ plainto_tsquery('spanish', unaccent($1))
          OR unaccent(r.titulo) ILIKE unaccent('%' || $1 || '%')

        UNION

        -- Buscar por INGREDIENTES
        SELECT r.*, 'ingrediente' AS tipo_coincidencia,
          ts_rank(to_tsvector('spanish', unaccent(i.nombre)), plainto_tsquery('spanish', unaccent($1))) AS relevancia
        FROM recetas r
        JOIN ingredientes i ON r.id = i.receta_id
        WHERE 
          to_tsvector('spanish', unaccent(i.nombre)) @@ plainto_tsquery('spanish', unaccent($1))
          OR unaccent(i.nombre) ILIKE unaccent('%' || $1 || '%')
      )
      SELECT DISTINCT * 
      FROM resultados
      ORDER BY relevancia DESC NULLS LAST;
    `;
    const result = await database.query(query, [termino]);
    return result.rows;
  }
};

module.exports = BusquedaTextoModel;
