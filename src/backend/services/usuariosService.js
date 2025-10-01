/**
 * @fileoverview Servicio de gestión de usuarios y autenticación
 * @author Danilo
 * @version 1.0.0
 * @description Lógica de negocio para registro, login y gestión de usuarios
 */

const UsuariosModel = require('../models/usuariosModel');
const bcrypt = require('bcrypt');

/**
 * Servicio de Usuarios
 * Maneja autenticación, registro y operaciones de usuario
 * @namespace UsuariosService
 */
const UsuariosService = {
  /**
   * Registrar nuevo usuario con validación de email único
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.email - Email único del usuario
   * @param {string} userData.contraseña - Contraseña sin cifrar
   * @param {string} userData.nombre - Nombre completo del usuario
   * @returns {Promise<Object>} Usuario creado (sin contraseña)
   * @throws {Error} Si el email ya está registrado
   */
  async registrarUsuario({ email, contraseña, nombre }) {
    // Verificar email único
    const usuarioExistente = await UsuariosModel.obtenerUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw new Error('El correo ya está registrado');
    }

    // Cifrado seguro con bcrypt (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    
    return await UsuariosModel.crearUsuario({ 
      email, 
      contraseña: hashedPassword, 
      nombre 
    });
  },

  /**
   * Crear usuario directo (sin validaciones)
   * Usado para operaciones internas del sistema
   * @param {Object} data - Datos completos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async crearUsuarioDirecto(data) {
    return await UsuariosModel.crearUsuario(data);
  },

  /**
   * Obtener todos los usuarios del sistema
   * @returns {Promise<Array>} Lista de usuarios (sin contraseñas)
   */
  async obtenerUsuarios() {
    return await UsuariosModel.obtenerTodos();
  },

  /**
   * Buscar usuario por email (para login)
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async obtenerUsuarioPorEmail(email) {
    return await UsuariosModel.obtenerUsuarioPorEmail(email);
  },

  /**
   * Obtener usuario por ID (para autenticación)
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async obtenerUsuarioPorId(id) {
    return await UsuariosModel.obtenerUsuarioPorId(id);
  }
};

/**
 * Exportación del servicio de usuarios
 * Servicio crítico para seguridad y autenticación
 */
module.exports = UsuariosService;