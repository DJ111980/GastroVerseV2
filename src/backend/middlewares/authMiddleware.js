/**
 * @fileoverview Middleware de autenticación JWT para rutas protegidas
 * @author Danilo
 * @version 1.0.0
 * @description Verifica tokens JWT y protege endpoints privados
 */

const jwt = require('jsonwebtoken');
const AuthService = require('../services/authService');
require('dotenv').config();

/**
 * Middleware principal de verificación de tokens JWT
 * Protege rutas que requieren autenticación
 * @param {Request} req - Objeto de petición HTTP
 * @param {Response} res - Objeto de respuesta HTTP  
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {Promise<void>} - Continúa o retorna error de autenticación
 */
const verificarToken = async (req, res, next) => {
  // Extraer header de autorización
  const authHeader = req.headers.authorization;

  // Verificar formato Bearer Token correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      codigo: 'TOKEN_MISSING'
    });
  }

  // Extraer token limpio del header
  const token = authHeader.split(' ')[1];

  // Validación básica de longitud del token
  if (!token || token.length < 10) {
    return res.status(401).json({ 
      error: 'Token inválido',
      codigo: 'TOKEN_MALFORMED'
    });
  }

  try {
    // Verificar si el token está en blacklist (sesión cerrada)
    const tokenEsValido = await AuthService.verificarTokenValido(token);
    
    if (!tokenEsValido) {
      return res.status(401).json({ 
        error: 'Token invalidado o sesión cerrada',
        codigo: 'TOKEN_BLACKLISTED'
      });
    }

    // Verificar y decodificar token JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar integridad del payload
    if (!payload.id || !payload.email) {
      return res.status(401).json({ 
        error: 'Token inválido - payload incompleto',
        codigo: 'TOKEN_INVALID_PAYLOAD'
      });
    }

    // Inyectar datos del usuario en request para controllers
    req.token = token;
    req.user = {
      id: payload.id,
      email: payload.email,
      nombre: payload.nombre,
      iat: payload.iat,
      exp: payload.exp
    };
    
    console.log('Token verificado exitosamente para usuario:', payload.id);
    next(); // Continuar a la siguiente función
  } catch (error) {
    console.error('Error en verificación de token:', error.message);
    
    // Manejo específico de errores JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        codigo: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        codigo: 'TOKEN_INVALID'
      });
    }
    
    // Error genérico de autenticación
    return res.status(401).json({ 
      error: 'Error de autenticación',
      codigo: 'AUTH_ERROR'
    });
  }
};

/**
 * Exportación del middleware para uso en rutas
 * Patrón de middleware Express estándar
 */
module.exports = { verificarToken };