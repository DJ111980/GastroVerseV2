/**
 * @fileoverview Rutas para gestión de ingredientes de recetas
 * @author Danilo
 * @version 1.0.0
 * @description Endpoints CRUD protegidos para manejo de ingredientes
 */

const express = require('express');
const router = express.Router();
const IngredientesController = require('../controllers/ingredientesController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { validarRecetaId, validarId, validarCrearIngrediente } = require('../middlewares/validaciones/usuariosValidator');
const manejoErroresValidacion = require('../middlewares/manejoErroresValidacion');

/**
 * Middleware global para todas las rutas de ingredientes
 * Requiere autenticación JWT válida
 */
router.use(verificarToken);

/**
 * POST /api/v1/ingredientes
 * Agregar nuevo ingrediente a una receta
 */
router.post('/', validarCrearIngrediente, manejoErroresValidacion, IngredientesController.agregarIngrediente);

/**
 * GET /api/v1/ingredientes/:receta_id
 * Obtener todos los ingredientes de una receta específica
 */
router.get('/:receta_id', validarRecetaId, manejoErroresValidacion, IngredientesController.obtenerIngredientesPorReceta);

/**
 * PUT /api/v1/ingredientes/:id
 * Actualizar ingrediente existente por ID
 */
router.put('/:id', validarId, manejoErroresValidacion, IngredientesController.actualizarIngrediente);

/**
 * DELETE /api/v1/ingredientes/:id
 * Eliminar ingrediente por ID
 */
router.delete('/:id', validarId, manejoErroresValidacion, IngredientesController.eliminarIngrediente);

module.exports = router;
module.exports = router;