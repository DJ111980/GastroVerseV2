/**
 * @fileoverview Rutas para gestión de recetas del sistema
 * @author Danilo
 * @version 1.1.0
 * @description Endpoints públicos y privados para CRUD de recetas, con manejo de subida de imágenes.
 */

const express = require('express');
const router = express.Router();
const RecetasController = require('../controllers/recetasController');
const { verificarToken } = require('../middlewares/authMiddleware'); 
const { validarId, validarCrearReceta } = require('../middlewares/validaciones/usuariosValidator');
const manejoErroresValidacion = require('../middlewares/manejoErroresValidacion');

// Importamos multer para la subida de archivos
const multer = require('multer');
// Configuramos multer para que guarde los archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

/**
 * RUTAS PÚBLICAS - No requieren autenticación
 */

router.get('/', RecetasController.obtenerTodas);
router.get('/misRecetas', verificarToken, RecetasController.obtenerMisRecetas);
router.get('/:id', validarId, manejoErroresValidacion, RecetasController.obtenerPorId);

/**
 * RUTAS PROTEGIDAS - Requieren token JWT
 */

/**
 * POST /api/v1/recetas
 * Crear nueva receta (solo usuarios autenticados)
 * Se utiliza upload.single('imagen') para procesar un único archivo llamado 'imagen'
 */
router.post(
  '/', 
  verificarToken, 
  upload.single('imagen'), // Middleware de Multer
  validarCrearReceta, 
  manejoErroresValidacion, 
  RecetasController.crearReceta
);

/**
 * PUT /api/v1/recetas/:id
 * Actualizar receta existente (solo propietario)
 * También procesa la subida de una nueva imagen
 */
router.put(
  '/:id', 
  verificarToken, 
  upload.single('imagen'), // Middleware de Multer
  validarId, 
  validarCrearReceta, 
  manejoErroresValidacion, 
  RecetasController.actualizarReceta
);

router.delete('/:id', verificarToken, validarId, manejoErroresValidacion, RecetasController.eliminarReceta);

module.exports = router;