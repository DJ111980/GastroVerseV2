/**
 * @fileoverview Middleware para manejo centralizado de errores de validación
 * @author Danilo
 * @version 1.0.0
 * @description Procesa errores de express-validator y retorna respuestas consistentes
 */

const { validationResult } = require('express-validator');

/**
 * Middleware de manejo de errores de validación
 * Intercepta errores de validación de express-validator y los formatea
 * @param {Request} req - Objeto de petición HTTP con datos validados
 * @param {Response} res - Objeto de respuesta HTTP
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {void} - Continúa o retorna error HTTP 400
 */
function manejoErroresValidacion(req, res, next) {
  // Extraer errores de validación acumulados por express-validator
  const errores = validationResult(req);

  // Si hay errores, retornar respuesta formateada
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      // Mapear errores a formato legible para el frontend
      detalles: errores.array().map(e => e.msg)
    });
  }

  // Si no hay errores, continuar al controller
  next();
}

/**
 * Exportación del middleware
 * Usado después de validadores en rutas para capturar errores
 */
module.exports = manejoErroresValidacion;