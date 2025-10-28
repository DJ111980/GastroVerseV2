/**
 * @fileoverview Servicio de gestión de favoritos de usuarios
 * @author Danilo
 * @version 1.0.0
 * @description Capa de servicio para operaciones CRUD de favoritos
 */

const FavoritosModel = require('../models/favoritosModel');

/**
 * Servicio de Favoritos
 * Maneja la lógica de negocio para gestión de recetas favoritas
 * @namespace FavoritosService
 */
const FavoritosService = {
  /**
   * Agregar receta a favoritos del usuario
   * @param {Object} data - Datos del favorito (usuario_id, receta_id)
   * @returns {Promise<Object>} Favorito creado
   * @throws {Error} Si hay error en la base de datos
   */
  async agregarFavorito(data) {
    return await FavoritosModel.agregarFavorito(data);
  },

  /**
   * Eliminar receta de favoritos
   * @param {number} usuario_id - ID del usuario
   * @param {number} receta_id - ID de la receta
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarFavorito(usuario_id, receta_id) {
    return await FavoritosModel.eliminarFavorito(usuario_id, receta_id);
  },

  /**
   * Obtener todas las recetas favoritas de un usuario
   * @param {number} usuario_id - ID del usuario
   * @returns {Promise<Array>} Lista de recetas favoritas
   */
  async obtenerFavoritos(usuario_id) {
    return await FavoritosModel.obtenerFavoritosPorUsuario(usuario_id);
  }
};

/**
 * Exportación del servicio de favoritos
 * Patrón Service Layer - lógica de negocio centralizada
 */
module.exports = FavoritosService;
