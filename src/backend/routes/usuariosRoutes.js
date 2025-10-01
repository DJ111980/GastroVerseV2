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
const { validarRegistroUsuario, validarLogin } = require('../middlewares/validaciones/usuariosValidator');
const manejoErroresValidacion = require('../middlewares/manejoErroresValidacion');

/**
 * POST /api/v1/usuarios
 * Registro de nuevo usuario con validaciones
 */
router.post('/', validarRegistroUsuario, manejoErroresValidacion, UsuariosController.crearUsuario);

/**
 * POST /api/v1/usuarios/login
 * Autenticación de usuario - genera JWT
 */
router.post('/login', validarLogin, manejoErroresValidacion, UsuariosController.loginUsuario);

/**
 * GET /api/v1/usuarios/me
 * Obtener perfil del usuario autenticado
 */
router.get('/me', verificarToken, UsuariosController.obtenerPerfil);

/**
 * POST /api/v1/usuarios/logout
 * Cerrar sesión - invalida token JWT
 */
router.post('/logout', verificarToken, UsuariosController.logout);

module.exports = router;
