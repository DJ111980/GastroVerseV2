// src/backend/setup-2fa-db.js
const database = require('./config/database');
require('dotenv').config();

async function setup2FATables() {
  try {
    console.log('🔧 Configurando base de datos para 2FA...');
    
    // Agregar columnas
    await database.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[],
      ADD COLUMN IF NOT EXISTS two_factor_method VARCHAR(20) DEFAULT 'authenticator',
      ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    
    console.log('✅ Columnas 2FA agregadas');
    
    // Actualizar usuarios existentes
    await database.query(`
      UPDATE usuarios 
      SET 
        two_factor_enabled = COALESCE(two_factor_enabled, false),
        two_factor_method = COALESCE(two_factor_method, 'authenticator'),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE two_factor_enabled IS NULL OR two_factor_method IS NULL;
    `);
    
    console.log('✅ Usuarios existentes actualizados');
    
    // Verificar
    const result = await database.query(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN two_factor_enabled = true THEN 1 ELSE 0 END) as con_2fa,
        SUM(CASE WHEN two_factor_enabled = false THEN 1 ELSE 0 END) as sin_2fa
      FROM usuarios;
    `);
    
    console.log('📊 Estadísticas:');
    console.log('   Total usuarios:', result.rows[0].total_usuarios);
    console.log('   Con 2FA habilitado:', result.rows[0].con_2fa);
    console.log('   Sin 2FA:', result.rows[0].sin_2fa);
    
    console.log('\n🎉 Base de datos lista para 2FA!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error configurando BD:', error.message);
    process.exit(1);
  }
}

setup2FATables();