/**
 * @fileoverview Modelo para gestión de tokens JWT invalidados
 * @author Danilo
 * @version 1.0.0
 * @description Maneja la blacklist de tokens para logout seguro
 */

const database = require('../config/database');

/**
 * Modelo para manejo de tokens en lista negra
 * Implementa logout seguro invalidando tokens JWT
 * @namespace TokenBlacklistModel
 */
const TokenBlacklistModel = {
  /**
   * Convierte diferentes formatos de fecha a UTC
   * Normaliza fechas de expiración para consistencia
   * @param {Date|number|string} fecha - Fecha en cualquier formato
   * @returns {Date|null} Fecha convertida a UTC o null si inválida
   */
  convertirAUTC(fecha) {
    if (!fecha) return null;

    if (fecha instanceof Date) {
      return new Date(fecha.getTime());
    }
    
    if (typeof fecha === 'number') {
      return new Date(fecha);
    }
    
    if (typeof fecha === 'string') {
      return new Date(fecha);
    }
    
    return new Date(fecha);
  },

  /**
   * Agrega un token a la lista negra
   * Usa ON CONFLICT para evitar duplicados
   * @param {string} token - Token JWT a invalidar
   * @param {number} usuario_id - ID del usuario propietario
   * @param {Date|number|string} expira_en - Fecha de expiración del token
   * @returns {Promise<Object>} Registro de token en blacklist
   * @throws {Error} Si falla la inserción
   */
  async agregarTokenAListaNegra(token, usuario_id, expira_en) {
    try {
      const expiraEnUTC = this.convertirAUTC(expira_en);
      
      console.log('Agregando token a blacklist:', {
        token: token.substring(0, 20) + '...',
        usuario_id,
        expira_en_original: expira_en,
        expira_en_utc: expiraEnUTC.toISOString()
      });
      
      const query = `
        INSERT INTO tokens_blacklist (token, usuario_id, expira_en)
        VALUES ($1, $2, $3)
        ON CONFLICT (token) DO UPDATE SET
          expira_en = EXCLUDED.expira_en,
          fecha_creacion = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const values = [token, usuario_id, expiraEnUTC.toISOString()];
      
      const result = await database.query(query, values);
      console.log('Token agregado exitosamente:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error agregando token a blacklist:', error);
      throw error;
    }
  },

  /**
   * Verifica si un token está en la lista negra
   * Limpia tokens expirados antes de verificar
   * @param {string} token - Token JWT a verificar
   * @returns {Promise<boolean>} true si está en blacklist, false si no
   */
  async estaEnListaNegra(token) {
    try {
      if (!token) {
        return false;
      }
      
      // Limpieza preventiva de tokens expirados
      await this.limpiarTokensExpirados();
      
      const query = `
        SELECT 
          COUNT(*) as count,
          CASE WHEN COUNT(*) > 0 THEN true ELSE false END as existe,
          MAX(expira_en) as max_expira_en,
          CURRENT_TIMESTAMP as ahora_utc
        FROM tokens_blacklist 
        WHERE token = $1 AND expira_en > CURRENT_TIMESTAMP
      `;
      
      const result = await database.query(query, [token]);
      const row = result.rows[0];
      
      console.log('Verificación de token en blacklist:', {
        token: token.substring(0, 20) + '...',
        existe: row.existe,
        count: row.count,
        max_expira_en: row.max_expira_en,
        ahora_utc: row.ahora_utc
      });
      
      return row.existe;
    } catch (error) {
      console.error('Error verificando token en blacklist:', error);
      return false;
    }
  },

  /**
   * Elimina tokens expirados de la blacklist
   * Mantenimiento automático de la tabla
   * @returns {Promise<number>} Cantidad de tokens eliminados
   */
  async limpiarTokensExpirados() {
    try {
      const query = `
        DELETE FROM tokens_blacklist 
        WHERE expira_en <= CURRENT_TIMESTAMP
      `;
      
      const result = await database.query(query);
      const eliminados = result.rowCount || 0;
      
      if (eliminados > 0) {
        console.log(`Tokens expirados eliminados: ${eliminados}`);
      }
      
      return eliminados;
    } catch (error) {
      console.error('Error limpiando tokens expirados:', error);
      return 0;
    }
  },

  /**
   * Función de debug para analizar estado de tokens
   * Útil para troubleshooting en desarrollo
   * @param {string} [token] - Token específico a analizar
   * @param {number} [usuario_id] - ID de usuario para filtrar
   * @returns {Promise<Array>} Lista de tokens con estado detallado
   */
  async debugTokenStatus(token = null, usuario_id = null) {
    try {
      let query = `
        SELECT 
          token,
          usuario_id,
          fecha_creacion,
          expira_en,
          CASE 
            WHEN expira_en > CURRENT_TIMESTAMP THEN 'ACTIVO' 
            ELSE 'EXPIRADO' 
          END as estado,
          EXTRACT(EPOCH FROM (expira_en - CURRENT_TIMESTAMP))/60 as minutos_para_expiracion,
          CURRENT_TIMESTAMP as ahora_utc
        FROM tokens_blacklist
      `;
      
      const conditions = [];
      const values = [];
      
      if (token) {
        conditions.push(`token = $${values.length + 1}`);
        values.push(token);
      }
      
      if (usuario_id) {
        conditions.push(`usuario_id = $${values.length + 1}`);
        values.push(usuario_id);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY fecha_creacion DESC`;
      
      const result = await database.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error en debugTokenStatus:', error);
      return [];
    }
  }
};

module.exports = TokenBlacklistModel;