/**
 * @fileoverview Controlador para gestión de recetas favoritas de usuarios
 * @author Danilo
 * @version 1.0.0
 * @description Maneja CRUD de favoritos - requiere autenticación JWT
 */

const FavoritosService = require('../services/favoritosService');

/**
 * Obtiene todas las recetas favoritas del usuario autenticado
 * @param {Object} req - Request con usuario en req.user (del middleware auth)
 * @param {Object} res - Response object
 * @returns {Promise<void>} Array de recetas favoritas del usuario
 */
const obtenerFavoritos = async (req, res) => {
  try {
    // ID del usuario viene del middleware de autenticación
    const usuario_id = req.user.id;
    
    // Delegación a capa de servicio
    const favoritos = await FavoritosService.obtenerFavoritos(usuario_id);
    
    res.json(favoritos);
  } catch (error) {
    // Error genérico - no exponer detalles internos
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

/**
 * Agrega una receta a favoritos del usuario
 * @param {Object} req - Request con usuario_id (auth) y receta_id (body)
 * @param {Object} res - Response object
 * @returns {Promise<void>} Favorito creado o error 409 si ya existe
 */
const agregarFavorito = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { receta_id } = req.body;

    // Intento de crear favorito
    const favorito = await FavoritosService.agregarFavorito({
      usuario_id: usuario_id,
      receta_id
    });

    // Validación de duplicados - el servicio retorna null si ya existe
    if (!favorito) {
      return res.status(409).json({ error: 'Ya está en favoritos' });
    }

    // Respuesta exitosa con código 201 (Created)
    res.status(201).json(favorito);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
};

/**
 * Elimina una receta de favoritos del usuario
 * @param {Object} req - Request con usuario_id (auth) y receta_id (params)
 * @param {Object} res - Response object
 * @returns {Promise<void>} Confirmación de eliminación o error 404
 */
const eliminarFavorito = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { receta_id } = req.params; // Viene de la URL

    // Intento de eliminación
    const resultado = await FavoritosService.eliminarFavorito(usuario_id, receta_id);
    
    // Validación de existencia
    if (!resultado) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }

    // Confirmación de operación exitosa
    res.json({ mensaje: 'Favorito eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
};

/**
 * Exportación de funciones del controlador
 * Patrón: Exportar objeto con métodos nombrados
 */
module.exports = {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
};

