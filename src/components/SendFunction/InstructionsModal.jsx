import "./InstructionsModal.css";
import PropTypes from "prop-types";

const InstructionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Não renderiza se não estiver aberto

  return (
    <div className="modal-instructions-overlay" onClick={onClose}>
      <div className="modal-instructions" onClick={(e) => e.stopPropagation()}>
        <div className="modal-instructions-header">
          <h3>Instruções para criar sua função</h3>
          <button className="instructions-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-instructions-content">
          <div className="instructions">
            <p>
              Sua função deve se chamar <b>Strategy</b> e vai receber os seguintes parâmetros:
            </p>
            <ul>
              <li>
                <b>card1, card2, card3:</b> Suas cartas disponíveis, podendo ser: pedra, papel, tesoura ou None (caso a carta já tenha sido usada).
              </li>
              <li>
                <b>opponentCard1, opponentCard2, opponentCard3:</b> Cartas do oponente disponíveis podendo ser: pedra, papel, tesoura ou None (caso a carta já tenha sido usada).
              </li>
            </ul>
            <p>
              A função deve retornar uma String que indica a carta que vai ser jogada, por exemplo: pedra, papel ou tesoura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

InstructionsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired, 
  };

export default InstructionsModal;
