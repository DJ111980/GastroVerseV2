/**
 * @fileoverview Componente de modal de confirmación reutilizable.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente renderiza una ventana modal genérica para solicitar
 * la confirmación del usuario antes de realizar una acción (ej. borrar).
 * Utiliza la librería `react-modal` para la funcionalidad subyacente.
 */

import React from 'react';
import Modal from 'react-modal';
import './ConfirmModal.css';

/**
 * Componente funcional que muestra un diálogo de confirmación.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible o no.
 * @param {Function} props.onRequestClose - Función que se llama al intentar cerrar el modal (ej. con la tecla Esc o clicando fuera).
 * @param {Function} props.onConfirm - Función que se ejecuta cuando el usuario hace clic en el botón "Aceptar".
 * @param {string} props.title - El título que se mostrará en la cabecera del modal.
 * @param {string} props.message - El mensaje o pregunta de confirmación que se mostrará al usuario.
 * @returns {JSX.Element} El componente de modal.
 */
const ConfirmModal = ({ isOpen, onRequestClose, onConfirm, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Ventana de Confirmación" // Etiqueta para accesibilidad
      className="confirm-modal"
      overlayClassName="confirm-modal-overlay"
    >
      <h2 className="modal-title">{title}</h2>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button onClick={onRequestClose} className="modal-button cancel">
          Cancelar
        </button>
        <button onClick={onConfirm} className="modal-button confirm">
          Aceptar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;