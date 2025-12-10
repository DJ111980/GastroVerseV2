/**
 * @fileoverview Modal para configurar 2FA
 * @author Ronald Niño
 * @version 1.0.0
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Setup2FAModal.css';

const Setup2FAModal = () => {
  const { twoFAFlow, enable2FA, close2FAModals } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await enable2FA(code);
    if (result.success) {
      setBackupCodes(result.backup_codes);
    } else {
      setError('Código inválido. Intenta de nuevo.');
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    if (backupCodes) {
      alert('¡Guarda tus códigos de respaldo en un lugar seguro!');
    }
    close2FAModals();
  };

  if (!twoFAFlow.showSetupModal) return null;

  return (
    <div className="setup-modal-overlay">
      <div className="setup-modal">
        {!backupCodes ? (
          <>
            <h2>Configurar Autenticación en Dos Pasos</h2>
            <p className="setup-description">
              1. Escanea el código QR con tu aplicación autenticadora (Google Authenticator, Authy, etc.)
            </p>
            
            {twoFAFlow.qrCode && (
              <div className="qr-container">
                <img src={twoFAFlow.qrCode} alt="QR Code para 2FA" className="qr-code" />
              </div>
            )}
            
            <p className="setup-description">
              2. Ingresa el código de 6 dígitos que aparece en tu aplicación:
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  className="twofa-input"
                  autoFocus
                />
              </div>
              
              {error && <p className="error-message">{error}</p>}
              
              <div className="setup-buttons">
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? 'Activando...' : 'Activar 2FA'}
                </button>
                
                <button
                  type="button"
                  className="auth-button secondary"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>✅ 2FA Activado Exitosamente</h2>
            <p className="setup-description">
              <strong>¡IMPORTANTE!</strong> Guarda estos códigos de respaldo en un lugar seguro.
              Son tu única forma de recuperar acceso si pierdes tu dispositivo.
            </p>
            
            <div className="backup-codes-container">
              {backupCodes.map((code, index) => (
                <div key={index} className="backup-code-item">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="setup-buttons">
              <button
                type="button"
                className="auth-button"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  alert('Códigos copiados al portapapeles');
                }}
              >
                Copiar Códigos
              </button>
              
              <button
                type="button"
                className="auth-button secondary"
                onClick={handleClose}
              >
                Continuar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Setup2FAModal;













