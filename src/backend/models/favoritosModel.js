/**
 * @fileoverview Modelo para gestión de recetas favoritas de usuarios
 * @author Danilo
 * @version 1.0.0
 * @description CRUD completo para sistema de favoritos con validación de integridad
 */

const database = require('../config/database');

/**
 * Modelo para operaciones con tabla favoritos
 * Maneja relación many-to-many entre usuarios y recetas
 * @namespace FavoritosModel
 */
const FavoritosModel = {
  /**
   * Agrega una receta a favoritos del usuario
   * Usa ON CONFLICT para evitar duplicados automáticamente
   * @param {Object} params - Parámetros del favorito
   * @param {number} params.usuario_id - ID del usuario
   * @param {number} params.receta_id - ID de la receta
   * @returns {Promise<Object|undefined>} Objeto favorito creado o undefined si ya existía
   * @throws {Error} Error específico si usuario o receta no existen
   */
  async agregarFavorito({ usuario_id, receta_id }) {
    try {
      const query = `
        INSERT INTO favoritos (usuario_id, receta_id)
        VALUES ($1, $2)
        ON CONFLICT (usuario_id, receta_id) DO NOTHING
        RETURNING *;
      `;
      const values = [usuario_id, receta_id];
      const result = await database.query(query, values);
      return result.rows[0]; // undefined si ya existía (DO NOTHING)
    } catch (error) {
      // Manejo específico de errores de foreign key
      if (error.code === '23503') {
        if (error.constraint.includes('usuario_id')) {
          throw new Error('Usuario no válido');
        }
        if (error.constraint.includes('receta_id')) {
          throw new Error('Receta no válida');
        }
      }
      throw error; // Re-lanzar otros errores
    }
  },

  /**
   * Elimina una receta de favoritos del usuario
   * @param {number} usuario_id - ID del usuario
   * @param {number} receta_id - ID de la receta a eliminar
   * @returns {Promise<Object|undefined>} Favorito eliminado o undefined si no existía
   */
  async eliminarFavorito(usuario_id, receta_id) {
    const result = await database.query(
      'DELETE FROM favoritos WHERE usuario_id = $1 AND receta_id = $2 RETURNING *',
      [usuario_id, receta_id]
    );
    return result.rows[0];
  },

  /**
   * Obtiene todas las recetas favoritas de un usuario
   * Incluye datos completos de la receta mediante JOIN
   * @param {number} usuario_id - ID del usuario
   * @returns {Promise<Array>} Array de recetas favoritas con fecha de agregado
   */
  async obtenerFavoritosPorUsuario(usuario_id) {
    const query = `
      SELECT r.*, f.fecha_agregado
      FROM favoritos f
      JOIN recetas r ON f.receta_id = r.id
      WHERE f.usuario_id = $1
      ORDER BY f.fecha_agregado DESC;
    `;
    const result = await database.query(query, [usuario_id]);
    return result.rows; // Ordenados por más recientes primero
  }
};

/**
 * Exportación del modelo para servicios
 * Encapsula lógica de favoritos con validaciones automáticas
 */
module.exports = FavoritosModel;
