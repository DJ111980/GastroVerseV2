/**
 * @fileoverview Controlador de autenticación y gestión de usuarios
 * @author Danilo
 * @version 1.0.0
 * @description Maneja registro, login, perfil y logout con JWT + bcrypt
 */

const UsuariosService = require('../services/usuariosService');
const AuthService = require('../services/authService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

/**
 * Controlador principal para gestión de usuarios y autenticación
 * Implementa flujo completo: registro → login → sesión → logout
 * @namespace UsuariosController
 */
const UsuariosController = {
  /**
   * Registrar nuevo usuario en el sistema
   * @async
   * @param {Object} req - Request con email, contraseña y nombre
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Usuario creado (sin contraseña) o error
   */
  async crearUsuario(req, res) {
    try {
      const usuario = await UsuariosService.registrarUsuario(req.body);
      
      // Respuesta sin datos sensibles - buena práctica de seguridad
      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          fecha_creacion: usuario.fecha_creacion
        }
      });
    } catch (error) {
      // Manejo específico para email duplicado
      if (error.message === 'El correo ya está registrado') {
        return res.status(400).json({ 
          error: error.message,
          codigo: 'EMAIL_ALREADY_EXISTS'
        });
      }
      
      // Error genérico para otros casos
      res.status(500).json({ 
        error: 'Error interno del servidor',
        codigo: 'REGISTRATION_SERVER_ERROR'
      });
    }
  },

  /**
   * Autenticar usuario y generar JWT
   * @async
   * @param {Object} req - Request con credenciales (email, contraseña)
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Token JWT + datos usuario o error
   */
  async loginUsuario(req, res) {
    const { email, contraseña } = req.body;

    // Validación básica de campos obligatorios
    if (!email || !contraseña) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos',
        codigo: 'MISSING_CREDENTIALS'
      });
    }

    try {
      // Búsqueda de usuario por email
      const usuario = await UsuariosService.obtenerUsuarioPorEmail(email);

      if (!usuario) {
        return res.status(401).json({ 
          error: 'Usuario no encontrado',
          codigo: 'USER_NOT_FOUND'
        });
      }

      // Verificación de contraseña hasheada con bcrypt
      const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
      if (!coincide) {
        return res.status(401).json({ 
          error: 'Contraseña incorrecta',
          codigo: 'INVALID_PASSWORD'
        });
      }

      // Generación de JWT con payload personalizado
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' } // Token expira en 2 horas
      );

      res.json({ 
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre
        },
        mensaje: 'Login exitoso'
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        codigo: 'LOGIN_SERVER_ERROR'
      });
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   * @async
   * @param {Object} req - Request con usuario en req.user (del middleware)
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Datos del perfil o error
   */
  async obtenerPerfil(req, res) {
    try {
      // req.user viene del middleware de autenticación
      const userId = req.user.id;
      const usuario = await UsuariosService.obtenerUsuarioPorId(userId);

      if (!usuario) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado',
          codigo: 'USER_NOT_FOUND'
        });
      }

      // Respuesta sin contraseña - seguridad
      res.json({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        fecha_creacion: usuario.fecha_creacion
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener perfil',
        codigo: 'PROFILE_SERVER_ERROR'
      });
    }
  },

  /**
   * Cerrar sesión invalidando el token JWT
   * @async
   * @param {Object} req - Request con token y usuario del middleware
   * @param {Object} res - Response de Express
   * @returns {Promise<void>} Confirmación de logout o error
   */
  async logout(req, res) {
    try {
      const token = req.token;
      const usuario_id = req.user.id;

      // Validación de datos necesarios para logout
      if (!token || !usuario_id) {
        return res.status(400).json({ 
          error: 'Token o usuario no encontrado',
          codigo: 'TOKEN_OR_USER_NOT_FOUND'
        });
      }

      // Logs para debugging - útil en desarrollo
      console.log('🔄 Iniciando proceso de logout...');
      console.log('👤 Usuario ID:', usuario_id);
      console.log('🎫 Token:', token.substring(0, 10) + '...');

      // Delegación al servicio de autenticación
      const resultado = await AuthService.logout(token, usuario_id);
      
      console.log('✅ Resultado del logout:', resultado);
      
      // Respuesta con timestamp para auditoria
      res.json({
        ...resultado,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error en logout controller:', error);
      
      // Manejo granular de errores específicos
      if (error.message.includes('Token inválido')) {
        return res.status(400).json({ 
          error: 'Token inválido para logout',
          codigo: 'INVALID_TOKEN_LOGOUT'
        });
      }
      
      if (error.message.includes('no pertenece al usuario')) {
        return res.status(403).json({ 
          error: 'Token no autorizado para este usuario',
          codigo: 'TOKEN_USER_MISMATCH'
        });
      }

      if (error.message.includes('ID de usuario inválido')) {
        return res.status(400).json({ 
          error: 'ID de usuario inválido',
          codigo: 'INVALID_USER_ID'
        });
      }
      
      // Error genérico con detalles para debugging
      res.status(500).json({ 
        error: 'Error interno al cerrar sesión',
        codigo: 'LOGOUT_SERVER_ERROR',
        detalles: error.message
      });
    }
  }
};

module.exports = UsuariosController;