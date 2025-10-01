/**
 * @fileoverview Configuración y conexión a base de datos PostgreSQL/Supabase
 * @author Danilo
 * @version 1.0.0
 * @description Pool de conexiones con pg para optimizar rendimiento
 */

const { Pool } = require('pg');
require('dotenv').config();

/**
 * Pool de conexiones a PostgreSQL
 * Configuración para Supabase con SSL habilitado
 * @type {Pool}
 */
const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  port: process.env.SUPABASE_PORT,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  database: process.env.SUPABASE_DB,
  ssl: {
    // Necesario para conexiones a Supabase
    rejectUnauthorized: false
  }
});

/**
 * Test de conexión inicial
 * Verifica conectividad al iniciar la aplicación
 */
pool.connect()
  .then((client) => {
    console.log("✅ Conectado exitosamente a Supabase/PostgreSQL");
    // Liberación inmediata del cliente al pool
    client.release();
  })
  .catch((err) => console.error("❌ Error al conectar a Supabase:", err));

/**
 * Exportación del pool para uso en modelos
 * Patrón Singleton - una sola instancia compartida
 */
module.exports = pool;