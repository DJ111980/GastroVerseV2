const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const UsuariosModel = require('../models/usuariosModel');
const crypto = require('crypto');

const TwoFactorService = {
  async setup2FA(userId) {
    // Generar secreto para 2FA
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `MiApp:${userId}`,
      issuer: 'MiApp'
    });
    
    // Generar URL para QR code
    const otpauthUrl = secret.otpauth_url;
    
    // Generar QR code como data URL (no guardamos imagen)
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    
    // Guardar secreto temporalmente (sin habilitar 2FA aún)
    await UsuariosModel.actualizarUsuario(userId, {
      two_factor_secret: secret.base32
    });
    
    return {
      secret: secret.base32,
      qr_code_url: qrCodeDataUrl,
      otpauth_url: otpauthUrl
    };
  },
  
  async verificarCodigo2FA(userId, token, secretBase32) {
    if (!secretBase32) {
      // Obtener secreto de la BD si no se proporciona
      const usuario = await UsuariosModel.obtenerUsuarioPorId(userId);
      secretBase32 = usuario.two_factor_secret;
    }
    
    const esValido = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: token.toString(),
      window: 1 // Permite 30 segundos de diferencia
    });
    
    return esValido;
  },
  
  async activar2FA(userId, token) {
    const usuario = await UsuariosModel.obtenerUsuarioPorId(userId);
    
    if (!usuario.two_factor_secret) {
      throw new Error('No hay configuración de 2FA pendiente');
    }
    
    // Verificar código
    const esValido = await this.verificarCodigo2FA(
      userId, 
      token, 
      usuario.two_factor_secret
    );
    
    if (!esValido) {
      throw new Error('Código 2FA inválido');
    }
    
    // Generar códigos de respaldo (8 códigos de 8 dígitos)
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomInt(10000000, 99999999).toString()
    );
    
    // Habilitar 2FA y guardar códigos de respaldo
    await UsuariosModel.actualizarUsuario(userId, {
      two_factor_enabled: true,
      two_factor_backup_codes: backupCodes
    });
    
    return {
      backup_codes: backupCodes,
      mensaje: 'Guarda estos códigos en un lugar seguro'
    };
  },
  
  async desactivar2FA(userId) {
    await UsuariosModel.actualizarUsuario(userId, {
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null
    });
  },
  
  async verificarBackupCode(userId, backupCode) {
    const usuario = await UsuariosModel.obtenerUsuarioPorId(userId);
    
    if (!usuario.two_factor_backup_codes || !Array.isArray(usuario.two_factor_backup_codes)) {
      return false;
    }
    
    const index = usuario.two_factor_backup_codes.indexOf(backupCode);
    
    if (index === -1) {
      return false;
    }
    
    // Remover el código usado
    const nuevosBackupCodes = usuario.two_factor_backup_codes.filter((_, i) => i !== index);
    
    await UsuariosModel.actualizarUsuario(userId, {
      two_factor_backup_codes: nuevosBackupCodes
    });
    
    return true;
  },
  
  async regenerarBackupCodes(userId) {
    const usuario = await UsuariosModel.obtenerUsuarioPorId(userId);
    
    if (!usuario.two_factor_enabled) {
      throw new Error('2FA no está habilitado');
    }
    
    // Generar nuevos códigos
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomInt(10000000, 99999999).toString()
    );
    
    await UsuariosModel.actualizarUsuario(userId, {
      two_factor_backup_codes: backupCodes
    });
    
    return backupCodes;
  }
};

module.exports = TwoFactorService;