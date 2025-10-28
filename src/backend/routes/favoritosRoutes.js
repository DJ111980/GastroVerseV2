/**
 * @fileoverview Rutas para gestión de recetas favoritas
 * @author Danilo
 * @version 1.0.0
 * @description Endpoints protegidos para sistema de favoritos
 */

const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const FavoritosController = require('../controllers/favoritosController');
const { validarRecetaId } = require('../middlewares/validaciones/usuariosValidator');
const manejoErroresValidacion = require('../middlewares/manejoErroresValidacion');

const { body } = require('express-validator');

/**
 * Validación para agregar favorito
 * Requiere receta_id como entero positivo
 */
const validarAgregarFavorito = [
  body('receta_id')
    .notEmpty().withMessage('El receta_id es obligatorio')
    .isInt({ min: 1 }).withMessage('receta_id debe ser un número entero positivo')
    .toInt()
];

/**
 * Middleware de autenticación aplicado a todas las rutas
 * Todas las operaciones de favoritos requieren usuario autenticado
 */
router.use(verificarToken);

/**
 * GET /api/v1/favoritos
 * Obtiene todas las recetas favoritas del usuario autenticado
 * Retorna lista con información de recetas y fechas
 */
router.get('/', FavoritosController.obtenerFavoritos);

/**
 * POST /api/v1/favoritos
 * Agrega una receta a favoritos del usuario
 * Body: { receta_id: number }
 */
router.post('/', validarAgregarFavorito, manejoErroresValidacion, FavoritosController.agregarFavorito);

/**
 * DELETE /api/v1/favoritos/:receta_id
 * Elimina una receta de favoritos del usuario
 * Parámetros: receta_id (número entero positivo)
 */
router.delete('/:receta_id', validarRecetaId, manejoErroresValidacion, FavoritosController.eliminarFavorito);

module.exports = router;

