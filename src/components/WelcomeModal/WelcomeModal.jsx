import { useState } from "react";
import PropTypes from "prop-types";
import "./WelcomeModal.css";
import WandaIllustration from "../../assets/arena-background-pixel-art.png";
import cosmoImg from "../../assets/cosmo-avatar.png";
import timmyImg from "../../assets/timmy.png";
import wandaImg from "../../assets/wanda.png";

export default function WelcomeModal({ onStart, onSkip }) {
  const [page, setPage] = useState(0);

  return (
    <div className="wm-overlay">
      <div className="wm-modal">
        {page === 0 ? (
          <>
            <h2 className="wm-title">
              Bem-vindo ao Editor de Funções do Wanda!
            </h2>
            <p className="wm-text">
              Aqui você vai criar suas estratégias de Jokenpô com a ajuda de
              nossos assistentes inteligentes.
            </p>
            <img
              className="wm-image"
              src={WandaIllustration}
              alt="Wanda recepcionando"
            />
            <div className="wm-buttons">
              <button
                className="wm-button wm-button--primary"
                onClick={() => setPage(1)}
              >
                Próximo
              </button>
              <button className="wm-button" onClick={onSkip}>
                Pular
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="wm-title">Conheça nossos Assistentes</h2>
            <ul className="wm-agent-list">
              <li className="wm-agent-item">
                <img src={cosmoImg} alt="Cosmo" className="wm-agent-img" />
                <div>
                  <strong>Cosmo:</strong> detalha cada passo do seu código.
                </div>
              </li>
              <li className="wm-agent-item">
                <img src={timmyImg} alt="Timmy" className="wm-agent-img" />
                <div>
                  <strong>Timmy:</strong> respostas curtas e objetivas.
                </div>
              </li>
              <li className="wm-agent-item">
                <img src={wandaImg} alt="Wanda" className="wm-agent-img" />
                <div>
                  <strong>Wanda:</strong> equilíbrio entre detalhe e concisão.
                </div>
              </li>
            </ul>
            <div className="wm-buttons">
              <button className="wm-button" onClick={() => setPage(0)}>
                Voltar
              </button>
              <button
                className="wm-button wm-button--primary"
                onClick={onStart}
              >
                Começar Tour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

WelcomeModal.propTypes = {
  onStart: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};
