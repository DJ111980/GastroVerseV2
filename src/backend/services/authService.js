/**
 * @fileoverview Servicio de autenticación y gestión de tokens JWT
 * @author Danilo
 * @version 1.0.0
 * @description Lógica de negocio para logout y validación de tokens
 */

const TokenBlacklistModel = require('../models/tokenBlacklistModel');
const jwt = require('jsonwebtoken');

const AuthService = {
  /**
   * Cerrar sesión del usuario
   * Agrega token a lista negra hasta su expiración
   * @param {string} token - JWT del usuario
   * @param {number} usuario_id - ID del usuario
   * @returns {Object} Resultado del logout
   */
  async logout(token, usuario_id) {
    try {
      // Validación inicial del token
      if (!token || typeof token !== 'string') {
        throw new Error('Token inválido o no proporcionado');
      }

      const userId = typeof usuario_id === 'string' ? parseInt(usuario_id) : usuario_id;
      
      if (!userId || isNaN(userId)) {
        throw new Error('ID de usuario inválido');
      }

      // Decodificación del token para extraer datos
      let decoded;
      try {
        decoded = jwt.decode(token);
      } catch (decodeError) {
        throw new Error('Token malformado - no se puede decodificar');
      }
      
      if (!decoded || !decoded.exp) {
        throw new Error('Token inválido o sin información de expiración');
      }
      
      // Verificar que el token pertenece al usuario
      if (decoded.id !== userId) {
        throw new Error('El token no pertenece al usuario especificado');
      }
      
      const expiraEn = new Date(decoded.exp * 1000);
      const ahora = new Date();
      
      // Si ya expiró, no necesita blacklist
      if (expiraEn <= ahora) {
        return { 
          success: true, 
          mensaje: 'Token ya expirado, sesión cerrada',
          ya_expirado: true
        };
      }
      
      // Agregar a lista negra y verificar
      const resultado = await TokenBlacklistModel.agregarTokenAListaNegra(token, userId, expiraEn);
      const verificacion = await TokenBlacklistModel.estaEnListaNegra(token);
      
      return { 
        success: true, 
        mensaje: 'Sesión cerrada exitosamente',
        verificado: verificacion,
        token_info: {
          expira_en: expiraEn.toISOString(),
          agregado_a_blacklist: !!resultado
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  },

  /**
   * Verificar si un token JWT es válido
   * Comprueba firma, expiración y lista negra
   * @param {string} token - JWT a verificar
   * @param {number} usuario_id - ID opcional para verificar propietario
   * @returns {boolean} true si el token es válido
   */
  async verificarTokenValido(token, usuario_id = null) {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }

      // Verificar lista negra primero
      const estaEnListaNegra = await TokenBlacklistModel.estaEnListaNegra(token);
      
      if (estaEnListaNegra) {
        console.log('Token encontrado en lista negra:', token.substring(0, 20) + '...');
        return false;
      }

      // Verificar firma y expiración
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        console.log('Error verificando JWT:', jwtError.message);
        return false;
      }

      if (!decoded || !decoded.id) {
        return false;
      }

      // Verificar que el token pertenece al usuario especificado
      if (usuario_id) {
        const userId = typeof usuario_id === 'string' ? parseInt(usuario_id) : usuario_id;
        if (decoded.id !== userId) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error en verificarTokenValido:', error.message);
      return false;
    }
  }
};

module.exports = AuthService;