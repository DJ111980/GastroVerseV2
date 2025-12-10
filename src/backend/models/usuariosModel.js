/**
 * @fileoverview Modelo para gestión de usuarios del sistema
 * @author Danilo
 * @version 1.0.0
 * @description CRUD básico para usuarios con autenticación
 */

const database = require('../config/database');

const UsuariosModel = {
  async crearUsuario({ email, contraseña, nombre }) {
    const query = `
      INSERT INTO usuarios (email, contraseña, nombre) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const values = [email, contraseña, nombre];
    const result = await database.query(query, values);
    return result.rows[0];
  },
  
  async obtenerUsuarioPorEmail(email) {
    const result = await database.query(
      'SELECT * FROM usuarios WHERE email = $1', 
      [email]
    );
    return result.rows[0];
  },
  
  async obtenerUsuarioPorId(id) {
    const result = await database.query(
      'SELECT * FROM usuarios WHERE id = $1', 
      [id]
    );
    return result.rows[0];
  },
  
  async obtenerTodos() {
    const result = await database.query(
      'SELECT id, email, nombre, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
    );
    return result.rows;
  },
  
  async actualizarUsuario(id, datos) {
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    
    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE usuarios 
      SET ${setClause}, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *;
    `;
    
    const values = [id, ...valores];
    const result = await database.query(query, values);
    return result.rows[0];
  },
  
  async obtenerTwoFactorSecret(userId) {
    const result = await database.query(
      'SELECT two_factor_secret FROM usuarios WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.two_factor_secret;
  }
};

module.exports = UsuariosModel;