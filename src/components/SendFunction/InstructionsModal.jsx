import "./InstructionsModal.css";
import PropTypes from "prop-types";

const InstructionsModal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null; 

  return (
    <div className="modal-instructions-overlay" onClick={onClose}>
      <div className="modal-instructions" onClick={(e) => e.stopPropagation()}>
        <div className="modal-instructions-header">
          <h3>{title}</h3>
          <button className="instructions-close-btn" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className="modal-instructions-content">{children}</div>

        {footer && <div className="modal-instructions-footer">{footer}</div>}
      </div>
    </div>
  );
};

InstructionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node, 
};

InstructionsModal.defaultProps = {
  title: "Instruções para criar sua função",
  footer: null,
};

export default InstructionsModal;
