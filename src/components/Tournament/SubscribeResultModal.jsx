import { useEffect } from 'react'
import { createPortal } from 'react-dom';
import PropTypes from "prop-types";
import "./SubscribeResultModal.css";

export default function SubscribeResultModal({
  isOpen,
  onClose,
  success,
  message,
}) {
  useEffect(() => {
    if (!isOpen){
      return undefined
    }

    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])
  if (!isOpen) return null;
  return createPortal (
    <div className="modal-subscribe-overlay" onClick={onClose}>
      <div
        className="modal-subscribe-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-subscribe-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          x
        </button>
        <h3 className="modal-subscribe-title">
          {success ? "Inscrição bem‑sucedida!" : "Falha na inscrição"}
        </h3>
        <p className="modal-subscribe-message">{message}</p>
        <button
          className="modal-subscribe-button"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}

SubscribeResultModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  success: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};
