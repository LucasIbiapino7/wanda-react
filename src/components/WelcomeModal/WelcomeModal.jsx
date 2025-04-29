import { useState } from "react";
import PropTypes from "prop-types";
import "./WelcomeModal.css";
import WandaIllustration from "../../assets/welcome-modal.png";
import cosmoImg from "../../assets/cosmo-avatar.png";
import timmyImg from "../../assets/timmy.png";
import wandaImg from "../../assets/wanda.png";

export default function WelcomeModal({ onStart, onSkip }) {
  const [page, setPage] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="wm-overlay">
      <div className="wm-modal">
        {page === 0 && (
          <>
            <h2 className="wm-title">
              Bem-vindo ao Editor de Funções do Wanda!
            </h2>
            <p className="wm-text">
              Aqui você vai criar suas estratégias para o Jokenpô e contar com o
              feedback dos nossos assistentes virtuais!
            </p>
            <img
              className="wm-image"
              src={WandaIllustration}
              alt="Wanda recepcionando"
            />
            <div className="wm-buttons">
              <div className="wm-button-group">
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
              <label className="wm-dont-show">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={() => setDontShowAgain(!dontShowAgain)}
                />
                Não mostrar novamente
              </label>
            </div>
          </>
        )}

        {page === 1 && (
          <>
            <h2 className="wm-title">Conheça nossos Assistentes</h2>
            <ul className="wm-agent-list">
              <li className="wm-agent-item">
                <img src={cosmoImg} alt="Cosmo" className="wm-agent-img" />
                <div>
                  <strong>Cosmo:</strong> Mais detalhista nas suas respostas,
                  gosta de falar bastante.
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
            <div className="wm-agents-text">
              <p>
                Cada um deles tem uma personalidade diferente nas suas
                respostas, e cabe a você escolher um deles para ser o seu! Mas
                claro, fique à vontade para alternar entre eles enquanto escreve
                sua função!
              </p>
            </div>
            <div className="wm-buttons">
              <div className="wm-button-group">
                <button className="wm-button" onClick={() => setPage(0)}>
                  Voltar
                </button>
                <button
                  className="wm-button wm-button--primary"
                  onClick={() => setPage(2)}
                >
                  Próximo
                </button>
              </div>
              <label className="wm-dont-show">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={() => setDontShowAgain(!dontShowAgain)}
                />
                Não mostrar novamente
              </label>
            </div>
          </>
        )}

        {page === 2 && (
          <>
            <h2 className="wm-title">Exemplo de Código</h2>
            <div className="wm-code-example">
              <pre>
                {`def strategy(card1, card2, card3):
    if card1 == "pedra"
        return card1`}
              </pre>
              <p>
                Neste exemplo falta o dois-pontos (<code>:</code>) após a
                condição <code>if</code>. Cada agente vai apontar esse erro de
                uma forma diferente e você vai poder ver isso nas próximas
                etapas!
              </p>
            </div>
            <div className="wm-buttons">
              <div className="wm-button-group">
                <button className="wm-button" onClick={() => setPage(1)}>
                  Voltar
                </button>
                <button
                  className="wm-button wm-button--primary"
                  onClick={onStart}
                >
                  Começar Tour
                </button>
              </div>
              <label className="wm-dont-show">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={() => setDontShowAgain(!dontShowAgain)}
                />
                Não mostrar novamente
              </label>
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
