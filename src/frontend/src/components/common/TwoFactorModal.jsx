/**
 * @fileoverview Modal para verificar código 2FA
 * @author Ronald Niño
 * @version 1.0.0
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TwoFactorModal.css';

const TwoFactorModal = () => {
  const { twoFAFlow, verify2FA, showBackupModal, close2FAModals } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await verify2FA(code);
    if (!result.success) {
      setError('Código inválido. Intenta de nuevo.');
    }
    
    setLoading(false);
  };

  if (!twoFAFlow.showModal && !twoFAFlow.showBackupModal) return null;

  return (
    <div className="twofa-modal-overlay">
      <div className="twofa-modal">
        <h2>Verificación en Dos Pasos</h2>
        <p className="twofa-description">
          {twoFAFlow.showBackupModal 
            ? 'Ingresa uno de tus códigos de respaldo de 8 dígitos'
            : 'Ingresa el código de 6 dígitos de tu aplicación autenticadora'
          }
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder={twoFAFlow.showBackupModal ? "12345678" : "123456"}
              maxLength={twoFAFlow.showBackupModal ? 8 : 6}
              className="twofa-input"
              autoFocus
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="twofa-buttons">
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || code.length !== (twoFAFlow.showBackupModal ? 8 : 6)}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
            
            <button
              type="button"
              className="auth-button secondary"
              onClick={close2FAModals}
            >
              Cancelar
            </button>
          </div>
        </form>
        
        {!twoFAFlow.showBackupModal && (
          <div className="twofa-links">
            <button 
              type="button" 
              className="link-button"
              onClick={showBackupModal}
            >
              ¿No tienes acceso a tu autenticador? Usa un código de respaldo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorModal;