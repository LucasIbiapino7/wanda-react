import PropTypes from "prop-types";
import "./SubscribeResultModal.css";

export default function SubscribeResultModal({
  isOpen,
  onClose,
  success,
  message,
}) {
  if (!isOpen) return null;
  return (
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
          ×
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
    </div>
  );
}

SubscribeResultModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  success: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};
