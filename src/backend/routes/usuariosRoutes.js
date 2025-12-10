/**
 * @fileoverview Rutas para autenticación y gestión de usuarios
 * @author Danilo
 * @version 1.0.0
 * @description Endpoints para registro, login, perfil y logout
 */

const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { 
  validarRegistroUsuario, 
  validarLogin,
  validar2FA 
} = require('../middlewares/validaciones/usuariosValidator');
const manejoErroresValidacion = require('../middlewares/manejoErroresValidacion');

// Rutas públicas
router.post('/', validarRegistroUsuario, manejoErroresValidacion, UsuariosController.crearUsuario);
router.post('/login', validarLogin, manejoErroresValidacion, UsuariosController.loginUsuario);
router.post('/login/verify-2fa', validar2FA, manejoErroresValidacion, UsuariosController.verificar2FA);
router.post('/login/backup-code', UsuariosController.verificarBackupCode);

// Rutas protegidas
router.get('/me', verificarToken, UsuariosController.obtenerPerfil);
router.post('/logout', verificarToken, UsuariosController.logout);

// Rutas de gestión 2FA
router.post('/2fa/setup', verificarToken, UsuariosController.setup2FA);
router.post('/2fa/enable', verificarToken, UsuariosController.enable2FA);
router.post('/2fa/disable', verificarToken, UsuariosController.disable2FA);

module.exports = router;