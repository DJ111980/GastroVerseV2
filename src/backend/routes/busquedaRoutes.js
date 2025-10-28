/**
 * @fileoverview Rutas para búsqueda y filtrado de recetas
 * @author Danilo
 * @version 1.0.0
 * @description Endpoints públicos para diferentes tipos de búsqueda
 */

const express = require('express');
const router = express.Router();
const BusquedaController = require('../controllers/busquedaController');
const { validarBusquedaIngrediente, validarFiltros, validarBusquedaTexto } = require('../middlewares/validaciones/usuariosValidator');
const manejoErroresValidacion = require('../middlewares/manejoErroresValidacion');

/**
 * GET /api/v1/busqueda/populares
 * Obtiene recetas más populares (con más favoritos)
 * Parámetros opcionales: limit, dificultad, tiempo_max
 */
router.get('/populares', validarFiltros, manejoErroresValidacion, BusquedaController.obtenerRecetasPopulares);

/**
 * GET /api/v1/busqueda/ingrediente
 * Busca recetas que contengan un ingrediente específico
 * Parámetros requeridos: ingrediente (mínimo 2 caracteres)
 */
router.get('/ingrediente', validarBusquedaIngrediente, manejoErroresValidacion, BusquedaController.buscarPorIngrediente);

/**
 * GET /api/v1/busqueda/filtrar
 * Filtra recetas por criterios múltiples
 * Parámetros opcionales: dificultad, tiempo_max, limit
 */
router.get('/filtrar', validarFiltros, manejoErroresValidacion, BusquedaController.filtrarRecetas);

/**
 * GET /api/v1/busqueda/titulo
 * Busca recetas por título usando coincidencia parcial
 * Parámetros requeridos: termino (2-100 caracteres)
 */
router.get('/titulo', validarBusquedaTexto, manejoErroresValidacion, BusquedaController.buscarPorTitulo);

/**
 * GET /api/v1/busqueda/general
 * Búsqueda global en títulos e ingredientes
 * Parámetros requeridos: termino (2-100 caracteres)
 */
router.get('/general', validarBusquedaTexto, manejoErroresValidacion, BusquedaController.busquedaGeneral);

module.exports = router;