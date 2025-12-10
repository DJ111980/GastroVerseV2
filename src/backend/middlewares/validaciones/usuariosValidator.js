/**
 * @fileoverview Middlewares de validación usando express-validator
 * @author Danilo
 * @version 1.0.0
 * @description Validaciones de entrada para todos los endpoints de la API
 */

const { body, param, query } = require('express-validator');

/**
 * Validación para búsqueda por ingrediente
 * Valida parámetro query 'ingrediente' mínimo 2 caracteres
 * @type {Array<ValidationChain>}
 */
const validarBusquedaIngrediente = [
  query('ingrediente')
    .notEmpty().withMessage('El parámetro ingrediente es requerido')
    .isLength({ min: 2 }).withMessage('El ingrediente debe tener al menos 2 caracteres')
    .trim() // Elimina espacios en blanco
];

/**
 * Validación para filtros de búsqueda avanzada
 * Valida dificultad, tiempo máximo y límite de resultados
 * @type {Array<ValidationChain>}
 */
const validarFiltros = [
  query('dificultad')
    .optional()
    .isIn(['Fácil', 'Intermedio', 'Difícil']).withMessage('Dificultad debe ser: Fácil, Intermedio o Difícil'),
  
  query('tiempo_max')
    .optional()
    .isInt({ min: 1, max: 1440 }).withMessage('tiempo_max debe ser entre 1 y 1440 minutos')
    .toInt(), // Conversión automática a entero
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100')
    .toInt()
];

/**
 * Validación para búsqueda de texto general
 * Sanitiza entrada para prevenir XSS y SQL injection
 * @type {Array<ValidationChain>}
 */
const validarBusquedaTexto = [
  query('termino')
    .notEmpty()
    .withMessage('El término de búsqueda es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El término debe tener entre 2 y 100 caracteres')
    .trim()
    .escape() // Sanitización contra XSS
];

/**
 * Validación robusta para registro de usuario
 * Incluye regex para contraseña segura
 * @type {Array<ValidationChain>}
 */
const validarRegistroUsuario = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Normalización estándar de email

  body('contraseña')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número'),

  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim()
];

/**
 * Validación básica para login
 * Solo verifica formato, no existencia (eso va en controlador)
 * @type {Array<ValidationChain>}
 */
const validarLogin = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('contraseña')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

/**
 * Validación para parámetros ID en URLs
 * Convierte a entero y valida que sea positivo
 * @type {Array<ValidationChain>}
 */
const validarId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt() // Conversión automática
];

/**
 * Validación para crear ingredientes
 * Campos obligatorios y opcionales con límites
 * @type {Array<ValidationChain>}
 */
const validarCrearIngrediente = [
  body('nombre')
    .notEmpty().withMessage('El nombre del ingrediente es obligatorio')
    .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .trim(),
    
  body('receta_id')
    .notEmpty().withMessage('El receta_id es obligatorio')
    .isInt({ min: 1 }).withMessage('receta_id debe ser un número entero positivo')
    .toInt(),
    
  body('cantidad')
    .optional()
    .isLength({ max: 100 }).withMessage('La cantidad no puede exceder 100 caracteres')
    .trim(),
    
  body('unidad')
    .optional()
    .isLength({ max: 50 }).withMessage('La unidad no puede exceder 50 caracteres')
    .trim()
];

/**
 * Validación para crear recetas
 * Títulos e instrucciones con longitudes mínimas
 * @type {Array<ValidationChain>}
 */
const validarCrearReceta = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres')
    .trim(),
    
  body('instrucciones')
    .notEmpty().withMessage('Las instrucciones son obligatorias')
    .isLength({ min: 10 }).withMessage('Las instrucciones deben tener al menos 10 caracteres')
    .trim(),
    
  body('tiempo_preparacion')
    .optional()
    .isInt({ min: 1, max: 1440 }).withMessage('El tiempo debe ser entre 1 y 1440 minutos')
    .toInt(),
    
  body('dificultad')
    .optional()
    .isIn(['Fácil', 'Intermedio', 'Difícil']).withMessage('Dificultad debe ser: Fácil, Intermedio o Difícil')
];

/**
 * Validación simplificada para crear usuario
 * Versión menos estricta que el registro completo
 * @type {Array<ValidationChain>}
 */
const validarCrearUsuario = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('contraseña')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim()
];

/**
 * Validación específica para receta_id en parámetros
 * Usado en rutas de ingredientes y favoritos
 * @type {Array<ValidationChain>}
 */
const validarRecetaId = [
  param('receta_id')
    .isInt({ min: 1 }).withMessage('El receta_id debe ser un número entero positivo')
    .toInt()
];

const validar2FA = [
  body('token_2fa')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código 2FA debe tener 6 dígitos')
    .isNumeric()
    .withMessage('El código 2FA debe ser numérico'),
  body('token_temporal').notEmpty().withMessage('Token temporal requerido')
];

// Exportación modular de todas las validaciones
module.exports = { 
  validarRegistroUsuario, 
  validarLogin,
  validarId,
  validarRecetaId,
  validarBusquedaIngrediente,
  validarFiltros,
  validarCrearIngrediente,
  validarCrearReceta,
  validarCrearUsuario,
  validarBusquedaTexto,
  validar2FA
};