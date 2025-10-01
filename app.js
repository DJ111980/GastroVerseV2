/**
 * @fileoverview Aplicación principal del servidor Express - GastroVerse API
 * @author Danilo
 * @version 1.0.0
 * @description Configuración del servidor, middlewares, rutas y manejo de errores
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/backend/config/database.js');

// Importación de rutas modulares (solo usuarios por ahora)
const usuariosRoutes = require('./src/backend/routes/usuariosRoutes.js');
// Las otras rutas (recetas, ingredientes, favoritos, busqueda) las mantendremos comentadas
// hasta que las necesites para evitar errores de módulos no encontrados si no están listos.
// const recetasRoutes = require('./src/backend/routes/recetasRoutes.js');
// const ingredientesRoutes = require('./src/backend/routes/ingredientesRoutes.js');
// const favoritosRoutes = require('./src/backend/routes/favoritosRoutes.js');
// const busquedaRoutes = require('./src/backend/routes/busquedaRoutes.js');

const app = express();
// CAMBIO CRÍTICO: Render usa process.env.PORT (por defecto 10000)
const PORT = process.env.PORT || 10000;

/**
 * Configuración CORS mejorada para Render
 * Desarrollo: múltiples puertos locales
 * Producción: dominio específico + render.com
 */
const allowedOrigins = [
    // Orígenes de producción
    process.env.FRONTEND_URL || 'Aqui va el url del frontend',
    /https:\/\/.*\.onrender\.com$/,
    // Orígenes de desarrollo (los incluimos siempre para facilitar las pruebas)
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin 'origin' (como las de Postman o apps móviles)
    if (!origin || allowedOrigins.some(pattern => 
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Token-Expires-In', 'X-Token-Status']
};


// Middlewares globales
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Límite para uploads de imágenes
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración para proxy en producción (Render requiere esto)
app.set('trust proxy', 1);

/**
 * Endpoint raíz - bienvenida simple
 */
app.get('/', (req, res) => {
  res.json({
    message: 'API de GastroVerse 🚀',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: 'Ver documentación en el repositorio',
      // Agregamos los endpoints principales de usuarios para referencia
      registro: '/api/v1/usuarios (POST)',
      login: '/api/v1/usuarios/login (POST)',
      perfil: '/api/v1/usuarios/me (GET)',
      logout: '/api/v1/usuarios/logout (POST)'
    }
  });
});

/**
 * Health check endpoint mejorado para Render
 * Verifica estado del servidor y conexión a BD
 * @returns {Object} Estado del sistema y metadatos
 */
app.get('/health', async (req, res) => {
  try {
    // Test simple de conectividad a BD
    const startTime = Date.now();
    await pool.query('SELECT 1');
    const dbResponseTime = Date.now() - startTime;
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      db_response_time: `${dbResponseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    // Respuesta de error con código 503 (Service Unavailable)
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      error: 'Database connection failed',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Configuración de versionado de API
const current_version = "v1";
const apiRouter = express.Router();

/**
 * Middleware de logging mejorado
 * Incluye información útil para debugging en Render
 */
if (process.env.NODE_ENV !== 'production') {
  apiRouter.use((req, res, next) => {
    console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    next();
  });
} else {
  // En producción, logging mínimo pero útil
  apiRouter.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });
}

// Registro de rutas modulares
apiRouter.use('/usuarios', usuariosRoutes);
// Comentadas temporalmente hasta que se necesiten
// apiRouter.use('/recetas', recetasRoutes);
// apiRouter.use('/ingredientes', ingredientesRoutes);
// apiRouter.use('/favoritos', favoritosRoutes);
// apiRouter.use('/busqueda', busquedaRoutes);

// Montaje del router con versionado
app.use(`/api/${current_version}`, apiRouter);

/**
 * Middleware catch-all para rutas no encontradas
 * Debe ir después de todas las rutas válidas
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    mensaje: `Intenta con /api/${current_version}/...`,
    available_routes: [
      `GET /`,
      `GET /health`,
      `POST /api/${current_version}/usuarios`, // Registro
      `POST /api/${current_version}/usuarios/login`, // Login
      `GET /api/${current_version}/usuarios/me`, // Perfil
      `POST /api/${current_version}/usuarios/logout` // Logout
    ]
  });
});

/**
 * Middleware global de manejo de errores mejorado
 * Incluye más información para debugging
 */
app.use((error, req, res, next) => {
  console.error('Error capturado:', error);
  
  const errorResponse = {
    error: 'Error interno del servidor',
    codigo: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  // En desarrollo, incluir más detalles del error
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = error.message;
    errorResponse.stack = error.stack;
  }

  res.status(error.status || 500).json(errorResponse);
});

/**
 * Manejo de errores críticos optimizado para Render
 * Graceful shutdown para evitar corrupción de datos
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // En Render, dar tiempo para logs antes de salir
  setTimeout(() => {
    process.exit(1);
  }, 2000);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Inicio del servidor HTTP optimizado para Render
 * Logs informativos sobre configuración
 */
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📋 API disponible en /api/${current_version}`);
  console.log(`🏥 Health check en /health`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Base URL: ${process.env.NODE_ENV === 'production' ? 'https://tu-app-de-render.onrender.com' : `http://localhost:${PORT}`}`); // Recordar reemplazar 'tu-app-de-render.onrender.com'
});

// Timeout de servidor más largo para Render
server.timeout = 120000; // 2 minutos

/**
 * Función de cierre controlado mejorada para Render
 * Cierra conexiones y recursos de forma ordenada
 */
const cerrarConexion = async () => {
  console.log("\n🛑 Señal SIGINT/SIGTERM recibida. Cerrando servidor...");

  // Timeout de seguridad para cierre forzado (Render necesita respuesta rápida)
  const timeout = setTimeout(() => {
    console.error("⏳ Cierre forzado después de 15 segundos");
    process.exit(1);
  }, 15000);

  try {
    // Cierre del servidor HTTP
    server.close(() => {
      console.log("✅ Servidor HTTP cerrado");
    });

    // Cierre del pool de conexiones a BD
    await pool.end();
    
    clearTimeout(timeout);
    console.log("✅ Conexión cerrada correctamente. Saliendo...");
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error("❌ Error al cerrar la conexión:", error);
    process.exit(1);
  }
};

// Listeners para señales de cierre del sistema
process.on('SIGINT', cerrarConexion);   // Ctrl+C
process.on('SIGTERM', cerrarConexion);  // Docker/PM2/Render stop

module.exports = app;