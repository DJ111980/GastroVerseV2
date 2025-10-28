/**
 * @fileoverview Aplicación principal del servidor Express - GastroVerse API
 * @author Danilo
 * @version 1.1.0
 * @description Configuración del servidor, middlewares, rutas y manejo de errores
 */

// Carga de variables de entorno. DEBE ser la primera línea.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./src/backend/config/database.js');

// Importación de rutas modulares con la estructura de carpetas correcta
const usuariosRoutes = require('./src/backend/routes/usuariosRoutes.js');
const recetasRoutes = require('./src/backend/routes/recetasRoutes.js');
const ingredientesRoutes = require('./src/backend/routes/ingredientesRoutes.js');
const favoritosRoutes = require('./src/backend/routes/favoritosRoutes.js');
const busquedaRoutes = require('./src/backend/routes/busquedaRoutes.js');

const app = express();
const PORT = process.env.PORT || 10000;

/**
 * Configuración CORS
 */
const allowedOrigins = [
    // Orígenes de producción
    process.env.FRONTEND_URL || 'https://gastroversev2-591w.onrender.com/',
    /https:\/\/.*\.onrender\.com$/,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración para proxy en producción
app.set('trust proxy', 1);

/**
 * Endpoint raíz
 */
app.get('/', (req, res) => {
  res.json({
    message: 'API de GastroVerse 🚀',
    version: '1.1.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: 'Ver documentación en el repositorio'
    }
  });
});

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    await pool.query('SELECT 1');
    const dbResponseTime = Date.now() - startTime;
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      database: 'connected',
      db_response_time: `${dbResponseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      version: '1.1.0',
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
 * Middleware de logging
 */
if (process.env.NODE_ENV !== 'production') {
  apiRouter.use((req, res, next) => {
    console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
} else {
  apiRouter.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });
}

// Registro de rutas modulares
apiRouter.use('/usuarios', usuariosRoutes);
apiRouter.use('/recetas', recetasRoutes);
apiRouter.use('/ingredientes', ingredientesRoutes);
apiRouter.use('/favoritos', favoritosRoutes);
apiRouter.use('/busqueda', busquedaRoutes);

// Montaje del router con versionado
app.use(`/api/${current_version}`, apiRouter);

/**
 * Middleware para manejar rutas no encontradas (404).
 * Esta es la forma correcta, sin '*' como argumento.
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    mensaje: `Intenta con /api/${current_version}/...`,
    available_routes: [
      `GET /`,
      `GET /health`,
      `GET /api/${current_version}/recetas`,
      `POST /api/${current_version}/usuarios/login`,
      `POST /api/${current_version}/usuarios`
    ]
  });
});

/**
 * Middleware global de manejo de errores.
 */
app.use((error, req, res, next) => {
  console.error('Error capturado:', error);
  
  const errorResponse = {
    error: 'Error interno del servidor',
    codigo: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = error.message;
    errorResponse.stack = error.stack;
  }

  res.status(error.status || 500).json(errorResponse);
});

/**
 * Inicio del servidor
 */
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📋 API disponible en /api/${current_version}`);
  console.log(`🏥 Health check en /health`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

server.timeout = 120000;

/**
 * Manejo de cierre controlado del servidor
 */
const cerrarConexion = async () => {
  console.log("\n🛑 Señal de cierre recibida. Cerrando servidor...");

  const timeout = setTimeout(() => {
    console.error("⏳ Cierre forzado después de 15 segundos");
    process.exit(1);
  }, 15000);

  try {
    server.close(() => {
      console.log("✅ Servidor HTTP cerrado");
    });
    await pool.end();
    clearTimeout(timeout);
    console.log("✅ Conexión a la base de datos cerrada. Saliendo...");
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error("❌ Error al cerrar la conexión:", error);
    process.exit(1);
  }
};

process.on('SIGINT', cerrarConexion);
process.on('SIGTERM', cerrarConexion);

module.exports = app;
