// src/components/FunctionModal/FunctionModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import "./FunctionModal.css";

export default function FunctionModal({ functions = [], isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="pfm-overlay" onClick={onClose}>
      <div className="pfm-container" onClick={(e) => e.stopPropagation()}>
        <header className="pfm-header">
          <h3 className="pfm-title">Funções do Jogador</h3>
          <button
            className="pfm-close-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        {functions.length > 0 ? (
          <>
            <nav className="pfm-tabs">
              {functions.map((fn, idx) => (
                <button
                  key={fn.name || idx}
                  className={
                    "pfm-tab" + (idx === activeTab ? " pfm-tab--active" : "")
                  }
                  onClick={() => setActiveTab(idx)}
                >
                  {fn.name || `Função ${idx + 1}`}
                </button>
              ))}
            </nav>

            <div className="pfm-body">
              <pre className="pfm-code">
                <code className="language-python">
                  {functions[activeTab].code}
                </code>
              </pre>
            </div>
          </>
        ) : (
          <div className="pfm-empty">Nenhuma função disponível.</div>
        )}
      </div>
    </div>
  );
}

FunctionModal.propTypes = {
  functions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      code: PropTypes.string.isRequired,
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
