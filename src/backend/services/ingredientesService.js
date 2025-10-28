/**
 * @fileoverview Servicio de gestión de ingredientes de recetas
 * @author Danilo
 * @version 1.0.0
 * @description Lógica de negocio para operaciones CRUD de ingredientes
 */

const IngredientesModel = require('../models/ingredientesModel');
const RecetasModel = require('../models/recetasModel');

/**
 * Función auxiliar para verificar la propiedad de una receta.
 * @param {number} recetaId - El ID de la receta a verificar.
 * @param {number} usuarioId - El ID del usuario que realiza la acción.
 * @throws {Error} Si la receta no existe o el usuario no es el propietario.
 */
async function verificarPropietarioReceta(recetaId, usuarioId) {
  const receta = await RecetasModel.obtenerPorId(recetaId);
  if (!receta) {
    throw new Error('La receta asociada no existe.');
  }
  if (receta.usuario_id !== usuarioId) {
    throw new Error('Acción no autorizada. No eres el propietario de la receta asociada.');
  }
}

/**
 * Servicio de Ingredientes
 * Centraliza operaciones de ingredientes para recetas
 * @namespace IngredientesService
 */
const IngredientesService = {
  /**
   * @param {Object} data - Datos del ingrediente (nombre, receta_id, cantidad, unidad)
   * @param {number} usuarioId - ID del usuario que lo agrega.
   */
  async crearIngrediente(data, usuarioId) {
    // Antes de crear, verificamos que el usuario es dueño de la receta
    await verificarPropietarioReceta(data.receta_id, usuarioId);
    return await IngredientesModel.crearIngrediente(data);
  },

  /**
   * Listar ingredientes de una receta específica
   * @param {number} receta_id - ID de la receta
   * @returns {Promise<Array>} Lista de ingredientes de la receta
   */
  async listarPorReceta(receta_id) {
    return await IngredientesModel.obtenerPorReceta(receta_id);
  },

  /**
   * @param {number} ingredienteId - ID del ingrediente.
   * @param {Object} data - Nuevos datos.
   * @param {number} usuarioId - ID del usuario que intenta la acción.
   */
  async actualizarIngrediente(ingredienteId, data, usuarioId) {
    const ingredienteExistente = await IngredientesModel.obtenerPorId(ingredienteId); // Necesitamos un método para buscar por ID
    if (!ingredienteExistente) {
        throw new Error('Ingrediente no encontrado.');
    }
    // Verificamos la propiedad de la receta padre
    await verificarPropietarioReceta(ingredienteExistente.receta_id, usuarioId);
    return await IngredientesModel.actualizarIngrediente(ingredienteId, data);
  },
  
  /**
   * @param {number} ingredienteId - ID del ingrediente.
   * @param {number} usuarioId - ID del usuario.
   */
  async eliminarIngrediente(ingredienteId, usuarioId) {
    const ingredienteExistente = await IngredientesModel.obtenerPorId(ingredienteId);
    if (!ingredienteExistente) {
        throw new Error('Ingrediente no encontrado.');
    }
    await verificarPropietarioReceta(ingredienteExistente.receta_id, usuarioId);
    return await IngredientesModel.eliminarIngrediente(ingredienteId);
  }
};
/**
 * Exportación del servicio de ingredientes
 * Patrón Service Layer para arquitectura MVC
 */
module.exports = IngredientesService;
