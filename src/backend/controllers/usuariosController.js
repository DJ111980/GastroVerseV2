/**
 * @fileoverview Controlador de autenticación y gestión de usuarios
 * @author Danilo
 * @version 1.0.0
 * @description Maneja registro, login, perfil y logout con JWT + bcrypt
 */

const UsuariosService = require('../services/usuariosService');
const AuthService = require('../services/authService');
const TwoFactorService = require('../services/twoFactorService'); // Nuevo servicio
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const UsuariosController = {
  async crearUsuario(req, res) {
    try {
      const usuario = await UsuariosService.registrarUsuario(req.body);
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
      if (error.message === 'El correo ya está registrado') {
        return res.status(400).json({ error: error.message, codigo: 'EMAIL_ALREADY_EXISTS' });
      }
      res.status(500).json({ error: 'Error interno del servidor', codigo: 'REGISTRATION_SERVER_ERROR' });
    }
  },

  async loginUsuario(req, res) {
    const { email, contraseña } = req.body;
    
    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos', codigo: 'MISSING_CREDENTIALS' });
    }
    
    try {
      const usuario = await UsuariosService.obtenerUsuarioPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado', codigo: 'USER_NOT_FOUND' });
      }
      
      const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
      if (!coincide) {
        return res.status(401).json({ error: 'Contraseña incorrecta', codigo: 'INVALID_PASSWORD' });
      }
      
      // Verificar si el usuario tiene 2FA habilitado
      if (usuario.two_factor_enabled) {
        // Generar token temporal para completar 2FA
        const tempToken = jwt.sign(
          { id: usuario.id, email: usuario.email, step: '2fa_verification' },
          process.env.JWT_SECRET,
          { expiresIn: '5m' } // Token temporal de 5 minutos
        );
        
        return res.json({
          requiere_2fa: true,
          token_temporal: tempToken,
          metodo_2fa: usuario.two_factor_method,
          mensaje: 'Se requiere verificación de dos factores'
        });
      }
      
      // Si no tiene 2FA, generar token normal
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
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
      res.status(500).json({ error: 'Error interno del servidor', codigo: 'LOGIN_SERVER_ERROR' });
    }
  },

  async verificar2FA(req, res) {
    const { token_2fa, token_temporal } = req.body;
    
    if (!token_2fa || !token_temporal) {
      return res.status(400).json({ 
        error: 'Token 2FA y token temporal son requeridos', 
        codigo: 'MISSING_2FA_DATA' 
      });
    }
    
    try {
      // Verificar token temporal
      const decoded = jwt.verify(token_temporal, process.env.JWT_SECRET);
      
      if (decoded.step !== '2fa_verification') {
        return res.status(400).json({ error: 'Token temporal inválido', codigo: 'INVALID_TEMP_TOKEN' });
      }
      
      const usuario = await UsuariosService.obtenerUsuarioPorId(decoded.id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'USER_NOT_FOUND' });
      }
      
      // Verificar código 2FA
      const esValido = await TwoFactorService.verificarCodigo2FA(
        usuario.id, 
        token_2fa,
        usuario.two_factor_secret
      );
      
      if (!esValido) {
        return res.status(401).json({ error: 'Código 2FA inválido', codigo: 'INVALID_2FA_CODE' });
      }
      
      // Generar token JWT final
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      res.json({
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre
        },
        mensaje: 'Verificación 2FA exitosa'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token temporal expirado', codigo: 'TEMP_TOKEN_EXPIRED' });
      }
      res.status(500).json({ error: 'Error en verificación 2FA', codigo: '2FA_SERVER_ERROR' });
    }
  },

  async obtenerPerfil(req, res) {
    try {
      const userId = req.user.id;
      const usuario = await UsuariosService.obtenerUsuarioPorId(userId);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'USER_NOT_FOUND' });
      }
      
      res.json({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        fecha_creacion: usuario.fecha_creacion,
        two_factor_enabled: usuario.two_factor_enabled,
        two_factor_method: usuario.two_factor_method
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener perfil', codigo: 'PROFILE_SERVER_ERROR' });
    }
  },

  async setup2FA(req, res) {
    try {
      const userId = req.user.id;
      
      // Generar secreto y QR code URL
      const setupData = await TwoFactorService.setup2FA(userId);
      
      res.json({
        success: true,
        ...setupData,
        mensaje: 'Configura el 2FA con tu aplicación autenticadora'
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al configurar 2FA', 
        codigo: '2FA_SETUP_ERROR',
        detalles: error.message 
      });
    }
  },

  async enable2FA(req, res) {
    const { token_2fa } = req.body;
    const userId = req.user.id;
    
    if (!token_2fa) {
      return res.status(400).json({ 
        error: 'Código 2FA es requerido', 
        codigo: 'MISSING_2FA_CODE' 
      });
    }
    
    try {
      const resultado = await TwoFactorService.activar2FA(userId, token_2fa);
      
      res.json({
        success: true,
        mensaje: '2FA activado exitosamente',
        backup_codes: resultado.backup_codes // Enviar códigos de respaldo una vez
      });
    } catch (error) {
      if (error.message === 'Código 2FA inválido') {
        return res.status(400).json({ error: error.message, codigo: 'INVALID_2FA_CODE' });
      }
      res.status(500).json({ error: 'Error al activar 2FA', codigo: '2FA_ENABLE_ERROR' });
    }
  },

  async disable2FA(req, res) {
    try {
      const userId = req.user.id;
      await TwoFactorService.desactivar2FA(userId);
      
      res.json({
        success: true,
        mensaje: '2FA desactivado exitosamente'
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al desactivar 2FA', codigo: '2FA_DISABLE_ERROR' });
    }
  },

  async verificarBackupCode(req, res) {
    const { backup_code } = req.body;
    const { token_temporal } = req.body;
    
    if (!backup_code || !token_temporal) {
      return res.status(400).json({ 
        error: 'Código de respaldo y token temporal son requeridos', 
        codigo: 'MISSING_BACKUP_DATA' 
      });
    }
    
    try {
      const decoded = jwt.verify(token_temporal, process.env.JWT_SECRET);
      const usuario = await UsuariosService.obtenerUsuarioPorId(decoded.id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'USER_NOT_FOUND' });
      }
      
      const esValido = await TwoFactorService.verificarBackupCode(
        usuario.id, 
        backup_code
      );
      
      if (!esValido) {
        return res.status(401).json({ 
          error: 'Código de respaldo inválido o ya usado', 
          codigo: 'INVALID_BACKUP_CODE' 
        });
      }
      
      // Generar token JWT final
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      res.json({
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre
        },
        mensaje: 'Acceso con código de respaldo exitoso'
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en verificación', codigo: 'BACKUP_CODE_ERROR' });
    }
  },

  async logout(req, res) {
    try {
      const token = req.token;
      const usuario_id = req.user.id;
      
      if (!token || !usuario_id) {
        return res.status(400).json({ 
          error: 'Token o usuario no encontrado', 
          codigo: 'TOKEN_OR_USER_NOT_FOUND' 
        });
      }
      
      const resultado = await AuthService.logout(token, usuario_id);
      res.json({
        ...resultado,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error en logout controller:', error);
      
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
      
      res.status(500).json({ 
        error: 'Error interno al cerrar sesión', 
        codigo: 'LOGOUT_SERVER_ERROR', 
        detalles: error.message 
      });
    }
  }
};

module.exports = UsuariosController;