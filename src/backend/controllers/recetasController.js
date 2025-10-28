/**
 * @fileoverview Controlador para gestión de recetas - Capa de control MVC
 * @author Danilo
 * @version 1.1.0
 * @description Maneja peticiones HTTP relacionadas con CRUD de recetas, incluyendo subida de imágenes.
 */

const RecetasService = require('../services/recetasService');

/**
 * Controlador de recetas siguiendo patrón MVC
 * Intercepta requests HTTP y delega lógica de negocio al servicio
 * @namespace RecetasController
 */
const RecetasController = {
  /**
   * Crear nueva receta con imagen opcional
   * @async
   * @param {Object} req - Request de Express con datos de receta y archivo de imagen
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} JSON con receta creada o error
   */
  async crearReceta(req, res) {
    try {
      const usuarioId = req.user.id;
      // El archivo de imagen viene en req.file gracias a multer
      const imagenFile = req.file; 
      
      const receta = await RecetasService.crearReceta(req.body, usuarioId, imagenFile);
      
      res.status(201).json({ mensaje: "Receta creada exitosamente", receta });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Obtener listado completo de recetas
   * @async
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Array de recetas en JSON
   */
  async obtenerTodas(req, res) {
    try {
      const recetas = await RecetasService.listarRecetas();
      res.json(recetas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener recetas' });
    }
  },

  /**
   * Obtener receta específica por ID
   * @async
   * @param {Object} req - Request con parámetro ID en URL
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Receta específica o error 404
   */
  async obtenerPorId(req, res) {
    try {
      const receta = await RecetasService.obtenerUna(req.params.id);
      
      if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
      
      res.json(receta);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Actualizar receta existente, con imagen opcional
   * @async
   * @param {Object} req - Request con ID, datos actualizados y archivo de imagen
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Receta actualizada o error
   */
  async actualizarReceta(req, res) {
    try {
      const recetaId = req.params.id;
      const usuarioId = req.user.id;
      const imagenFile = req.file;

      const receta = await RecetasService.actualizarReceta(recetaId, req.body, usuarioId, imagenFile);
      
      res.json({ mensaje: "Receta actualizada exitosamente", receta });
    } catch (error)
    {
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('no está autorizado')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Obtener las recetas creadas por el usuario autenticado.
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Un array con las recetas del usuario.
   */
  async obtenerMisRecetas(req, res) {
    try {
      const usuarioId = req.user.id;
      const recetas = await RecetasService.listarRecetasPorUsuario(usuarioId);
      res.json({
        total: recetas.length,
        recetas: recetas,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener tus recetas' });
    }
  },

  /**
   * Eliminar receta por ID y su imagen asociada del storage
   * @async
   * @param {Object} req - Request con ID en parámetros
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Confirmación de eliminación o error
   */
  async eliminarReceta(req, res) {
    try {
      const recetaId = req.params.id;
      const usuarioId = req.user.id;
      await RecetasService.eliminarReceta(recetaId, usuarioId);
      
      res.json({ mensaje: 'Receta eliminada correctamente' });
    } catch (error) {
       if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('no está autorizado')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = RecetasController;