import "./FunctionModal.css";
import PropTypes from 'prop-types';

const FunctionModal = ({ code, isOpen, onClose }) => {
  if (!isOpen) return null; // Se não estiver aberto, não renderiza nada

  return (
    <div className="function-modal-overlay" onClick={onClose}>
      <div className="function-modal" onClick={(e) => e.stopPropagation()}>
        <div className="function-modal-header">
          <h3>Função do Jogador</h3>
          <button className="function-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="function-modal-content">
          <pre>
            <code className="python">{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

FunctionModal.propTypes = {
    code: PropTypes.string.isRequired, 
    isOpen: PropTypes.bool.isRequired, 
    onClose: PropTypes.func.isRequired, 
  };

export default FunctionModal;
