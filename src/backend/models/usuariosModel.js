/**
 * @fileoverview Modelo para gestión de usuarios del sistema
 * @author Danilo
 * @version 1.0.0
 * @description CRUD básico para usuarios con autenticación
 */

const database = require('../config/database');

/**
 * Modelo de usuarios con operaciones básicas
 * Maneja registro, búsqueda y listado de usuarios
 * @namespace UsuariosModel
 */
const UsuariosModel = {
  /**
   * Registra un nuevo usuario en el sistema
   * @param {Object} userData - Datos del nuevo usuario
   * @param {string} userData.email - Email único del usuario
   * @param {string} userData.contraseña - Contraseña hasheada con bcrypt
   * @param {string} userData.nombre - Nombre completo del usuario
   * @returns {Promise<Object>} Usuario creado con ID asignado
   */
  async crearUsuario({ email, contraseña, nombre }) {
    const query = `
      INSERT INTO usuarios (email, contraseña, nombre)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [email, contraseña, nombre];
    const result = await database.query(query, values);
    return result.rows[0];
  },

  /**
   * Busca usuario por email para autenticación
   * Incluye contraseña para validación en login
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|undefined>} Usuario encontrado o undefined
   */
  async obtenerUsuarioPorEmail(email) {
    const result = await database.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0];
  },

  /**
   * Busca usuario por ID para sesiones autenticadas
   * @param {number} id - ID único del usuario
   * @returns {Promise<Object|undefined>} Usuario encontrado o undefined
   */
  async obtenerUsuarioPorId(id) {
    const result = await database.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0];
  },

  /**
   * Lista todos los usuarios registrados
   * Excluye contraseñas por seguridad
   * @returns {Promise<Array>} Lista de usuarios sin datos sensibles
   */
  async obtenerTodos() {
    const result = await database.query('SELECT id, email, nombre, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC');
    return result.rows;
  }
};

module.exports = UsuariosModel;