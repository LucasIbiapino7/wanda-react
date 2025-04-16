import PropTypes from 'prop-types';
import "./SuccessModal.css";

function SuccessModal({ isOpen, onClose, onProceed }) {
  if (!isOpen) return null;

  return (
    <div className="modal-sucess-overlay">
      <div className="modal-sucess-container">
        <h2>Pronto para escrever a segunda função!?</h2>
        <div className="modal-sucess-buttons">
          <button onClick={onClose} className="close-button-sucess">Fechar</button>
          <button onClick={onProceed} className="proceed-button">Avançar</button>
        </div>
      </div>
    </div>
  );
}

SuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
};

export default SuccessModal;