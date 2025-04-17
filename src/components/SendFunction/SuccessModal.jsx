import PropTypes from 'prop-types';
import "./SuccessModal.css";

const SuccessModal = ({ isOpen, onClose, title, message, onProceed }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-sucess-overlay" onClick={onClose}>
      <div className="modal-sucess-container" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-sucess-buttons">
          <button className="proceed-button" onClick={onProceed}>Avançar</button>
          <button className="close-button-sucess" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

SuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  title: "Função enviada com sucesso!",
  message: "Clique em Avançar para continuar."
};


export default SuccessModal;