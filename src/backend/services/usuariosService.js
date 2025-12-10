/**
 * @fileoverview Servicio de gestión de usuarios y autenticación
 * @author Danilo
 * @version 1.0.0
 * @description Lógica de negocio para registro, login y gestión de usuarios
 */

const UsuariosModel = require('../models/usuariosModel');
const bcrypt = require('bcrypt');

const UsuariosService = {
  async registrarUsuario({ email, contraseña, nombre }) {
    const usuarioExistente = await UsuariosModel.obtenerUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw new Error('El correo ya está registrado');
    }
    
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    return await UsuariosModel.crearUsuario({
      email,
      contraseña: hashedPassword,
      nombre
    });
  },
  
  async crearUsuarioDirecto(data) {
    return await UsuariosModel.crearUsuario(data);
  },
  
  async obtenerUsuarios() {
    return await UsuariosModel.obtenerTodos();
  },
  
  async obtenerUsuarioPorEmail(email) {
    return await UsuariosModel.obtenerUsuarioPorEmail(email);
  },
  
  async obtenerUsuarioPorId(id) {
    return await UsuariosModel.obtenerUsuarioPorId(id);
  },
  
  async actualizarUsuario(id, datos) {
    return await UsuariosModel.actualizarUsuario(id, datos);
  }
};

module.exports = UsuariosService;