/**
 * @fileoverview Modelo para gestión de ingredientes de recetas
 * @author Danilo
 * @version 1.0.0
 * @description CRUD completo para ingredientes con validación y actualización parcial
 */

const database = require('../config/database');

/**
 * Modelo para operaciones con tabla ingredientes
 * Maneja ingredientes asociados a recetas específicas
 * @namespace IngredientesModel
 */
const IngredientesModel = {
  /**
   * Crea un nuevo ingrediente asociado a una receta
   * Valida existencia de receta mediante foreign key
   * @param {Object} params - Datos del ingrediente
   * @param {string} params.nombre - Nombre del ingrediente
   * @param {number} params.receta_id - ID de la receta asociada
   * @param {string} [params.cantidad] - Cantidad del ingrediente (opcional)
   * @param {string} [params.unidad] - Unidad de medida (opcional)
   * @returns {Promise<Object>} Ingrediente creado con ID generado
   * @throws {Error} Error si la receta no existe
   */
  async crearIngrediente({ nombre, receta_id, cantidad, unidad }) {
    try {
      const query = `
        INSERT INTO ingredientes (nombre, receta_id, cantidad, unidad)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [nombre, receta_id, cantidad, unidad];
      const result = await database.query(query, values);
      return result.rows[0];
    } catch (error) {
      // Manejo de error de foreign key para receta inexistente
      if (error.code === '23503') {
        throw new Error('La receta especificada no existe');
      }
      throw error;
    }
  },

  /**
   * Obtiene todos los ingredientes de una receta específica
   * @param {number} receta_id - ID de la receta
   * @returns {Promise<Array>} Array de ingredientes de la receta
   */
  async obtenerPorReceta(receta_id) {
    const result = await database.query('SELECT * FROM ingredientes WHERE receta_id = $1', [receta_id]);
    return result.rows;
  },

  /**
   * Elimina todos los ingredientes de una receta
   * Usado cuando se elimina una receta completa
   * @param {number} receta_id - ID de la receta
   * @returns {Promise<Array>} Array de ingredientes eliminados
   */
  async eliminarPorReceta(receta_id) {
    const result = await database.query(
      'DELETE FROM ingredientes WHERE receta_id = $1 RETURNING *',
      [receta_id]
    );
    return result.rows;
  },

  /**
   * Actualiza un ingrediente específico
   * Usa COALESCE para actualización parcial (solo campos no nulos)
   * @param {number} id - ID del ingrediente a actualizar
   * @param {Object} params - Datos a actualizar
   * @param {string} [params.nombre] - Nuevo nombre (opcional)
   * @param {string} [params.cantidad] - Nueva cantidad (opcional)
   * @param {string} [params.unidad] - Nueva unidad (opcional)
   * @returns {Promise<Object|undefined>} Ingrediente actualizado o undefined si no existe
   */
  async actualizarIngrediente(id, { nombre, cantidad, unidad }) {
    try {
      const query = `
        UPDATE ingredientes 
        SET nombre = COALESCE($1, nombre), 
            cantidad = COALESCE($2, cantidad), 
            unidad = COALESCE($3, unidad)
        WHERE id = $4
        RETURNING *;
      `;
      const values = [nombre, cantidad, unidad, id];
      const result = await database.query(query, values);
      return result.rows[0]; // undefined si no encuentra el ID
    } catch (error) {
      throw error;
    }
  },

  /**
   * Elimina un ingrediente específico por ID
   * @param {number} id - ID del ingrediente a eliminar
   * @returns {Promise<Object|undefined>} Ingrediente eliminado o undefined si no existía
   */
  async eliminarIngrediente(id) {
    const result = await database.query(
      'DELETE FROM ingredientes WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
  
/**
   * Busca un ingrediente específico por su ID.
   * @param {number} id - ID del ingrediente.
   * @returns {Promise<Object|undefined>}
   */
  async obtenerPorId(id) {
    const result = await database.query('SELECT * FROM ingredientes WHERE id = $1', [id]);
    return result.rows[0];
  }
  
};

/**
 * Exportación del modelo para servicios
 * Maneja integridad referencial con recetas automáticamente
 */
module.exports = IngredientesModel;

