import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import "./SendFunctionJokenpo1.css";
import AuthContext from "../../../context/AuthContext";
import cosmo from "../../../assets/cosmo-avatar.png";
import timmy from "../../../assets/timmy.png";
import wanda from "../../../assets/wanda.png";
import like from "../../../assets/like.svg";
import dislike from "../../../assets/dislike.svg";
import InstructionsModal from "../InstructionsModal";
import SuccessModal from "../SuccessModal";
import WelcomeModal from "../../WelcomeModal/WelcomeModal";
import Joyride from "react-joyride";
import { tourSteps } from "../../../constants/tourSteps.jsx";

function SendFunctionJokenpo1() {
  const navigate = useNavigate();

  const defaultCode = "def strategy(card1, card2, card3):";
  const [text, setText] = useState(defaultCode);
  const [feedback, setFeedback] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackAgentId, setFeedbackAgentId] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [showWelcome, setShowWelcome] = useState(false);

  const [runTour, setRunTour] = useState(false); // Estado para controlar a tour

  const [hasSavedFunction, setHasSavedFunction] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const { token } = useContext(AuthContext);

  const [assistantStyle, setAssistantStyle] = useState(null);

  // Atualiza o agente selecionado
  const handleAgentTabClick = (agent) => {
    setAssistantStyle(agent);
    console.log("Mudando agente para:", agent);
  };

  // Exibe o modal ao abrir o componente
  useEffect(() => {
    const seen = localStorage.getItem("wandaTourSeen");
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  const handleStartTour = () => {
    setShowWelcome(false);
    setRunTour(true);
    localStorage.setItem("wandaTourSeen", "true");
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    localStorage.setItem("wandaTourSeen", "true");
  };

  // Carregar função salva ao montar o componente
  useEffect(() => {
    async function fetchSavedFunction() {
      try {
        const url = "http://localhost:8080/jokenpo/jokenpo1";
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200 && response.data && response.data.code) {
          setText(response.data.code);
          setHasSavedFunction(true); 
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setText(defaultCode);
        } else {
          console.error("Erro ao buscar função salva:", error);
        }
      }
    }
    fetchSavedFunction();
  }, [token, defaultCode]);


  useEffect(() => {
    if (!feedback) {
      setTypedMessage("");
      return;
    }
    const msg = feedback;
    let i = -1;
    setTypedMessage(" ");
    const intervalId = setInterval(() => {
      if (i < msg.length - 1) {
        setTypedMessage((prev) => prev + msg[i]);
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 30);
    return () => clearInterval(intervalId);
  }, [feedback]);

  // Envio do feedback ao backend
  const handleSubmitFeedback = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const url = "http://localhost:8080/jokenpo/feedback";
      const requestBody = {
        code: text,
        assistantStyle: assistantStyle,
        functionName: "jokenpo1",
      };
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setFeedbackAgentId(response.data.feedbackId);
      setFeedback(response.data.feedback);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro desconhecido ao enviar a função.";
      setFeedback(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Submissão da função
  const handleSubmitFunction = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const url = "http://localhost:8080/jokenpo";
      const requestBody = {
        code: text,
        assistantStyle: assistantStyle,
        functionName: "jokenpo1",
      };
      const response = await axios.put(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setFeedbackAgentId(response.data.feedbackId);
      setFeedback(response.data.feedback);
      if (response.data.valid) {
        setSuccessModalOpen(true);
        setHasSavedFunction(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro ao submeter a função.";
      setFeedback(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função do botão Run
  const handleRun = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const url = "http://localhost:8080/jokenpo/run";
      const requestBody = {
        code: text,
        assistantStyle: assistantStyle,
        functionName: "jokenpo1",
      };
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setFeedbackAgentId(response.data.feedbackId);
      setFeedback(response.data.feedback);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro ao executar a função.";
      setFeedback(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enviar feedback do usuário (like)
  const handleLike = async () => {
    console.log("like clicked!");
    try {
      const url = "http://localhost:8080/jokenpo/feedback-user";
      const requestBody = { feedbackId: feedbackAgentId, feedbackUser: "like" };
      await axios.put(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Feedback enviado com sucesso (like).");
      setFeedbackAgentId(null);
      setFeedbackSent(true);
    } catch (error) {
      console.error("Erro ao enviar feedback (like):", error);
    }
  };

  // Enviar feedback do usuário (dislike)
  const handleDislike = async () => {
    console.log("dislike clicked!");
    try {
      const url = "http://localhost:8080/jokenpo/feedback-user";
      const requestBody = {
        feedbackId: feedbackAgentId,
        feedbackUser: "dislike",
      };
      await axios.put(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Feedback enviado com sucesso (dislike).");
      setFeedbackAgentId(null);
      setFeedbackSent(true);
    } catch (error) {
      console.error("Erro ao enviar feedback (dislike):", error);
    }
  };

  // Modal de sucesso
  const handleProceedToFunction2 = () => {
    navigate("/jokenpo2");
  };

  // Controle do modal de instruções
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const handleOpenInstructions = () => {
    setInstructionsModalOpen(true);
  };
  const handleCloseInstructions = () => {
    setInstructionsModalOpen(false);
  };

  // Controle do modal de agentes
  const [agentsModalOpen, setAgentsModalOpen] = useState(false);
  const handleOpenAgents = () => {
    setAgentsModalOpen(true);
  };
  const handleCloseAgents = () => {
    setAgentsModalOpen(false);
  };

  return (
    <div className="container-sendfunction">
      {runTour && (
        <Joyride
          steps={tourSteps}
          run={true}
          disableBeacon
          continuous
          showProgress
          showSkipButton
          locale={{
            back: "Voltar",
            close: "Fechar",
            last: "Fim",
            next: "Próximo",
            skip: "Pular",
          }}
          styles={{
            options: {
              arrowColor: "#ffcc00",
              backgroundColor: "#1e1e1e",
              textColor: "#fff",
              primaryColor: "#ffcc00",
              spotlightPadding: 8,
            },
            tooltipContainer: {
              borderRadius: "8px",
              padding: "1rem",
            },
          }}
          callback={({ status }) => {
            if (["finished", "skipped"].includes(status)) {
              setRunTour(false);
            }
          }}
        />
      )}

      {showWelcome && (
        <WelcomeModal onStart={handleStartTour} onSkip={handleSkipTour} />
      )}
      <div className="top-section">
        <div className="informations-section">
          <h1>Função 1 – Sua Estratégia no Round 1</h1>
          <div className="progress-indicator">
            <span>Passo 1 de 2</span>
          </div>
          <div className="informations-section-buttons">
            <button onClick={handleOpenInstructions}>Instruções</button>
            <button onClick={handleOpenAgents}>Agentes</button>
            {hasSavedFunction && (
              <button
                className="next-function-button"
                onClick={() => setSuccessModalOpen(true)}
                title="Clique para ir para a função 2"
              >
                Vá para função 2!
              </button>
            )}
          </div>
        </div>
        <div className="editor-feedback-container">
          <div className="editor-section">
            <CodeMirror
              value={text}
              onChange={(newValue) => setText(newValue)}
              theme={dracula}
              extensions={[python()]}
              basicSetup={{ autocompletion: true, indentUnit: "    " }}
              minWidth={"100%"}
              minHeight={"550px"}
            />
          </div>
          <div className="feedback-space">
            <div className="agent-tabs">
              <div
                className={`agent-tab ${
                  assistantStyle === "VERBOSE" ? "active" : ""
                }`}
                onClick={() => handleAgentTabClick("VERBOSE")}
              >
                <img src={cosmo} alt="Cosmo" className="agent-img" />
                <span>Cosmo</span>
              </div>
              <div
                className={`agent-tab ${
                  assistantStyle === "SUCCINCT" ? "active" : ""
                }`}
                onClick={() => handleAgentTabClick("SUCCINCT")}
              >
                <img src={timmy} alt="Timmy" className="agent-img" />
                <span>Timmy</span>
              </div>
              <div
                className={`agent-tab ${
                  assistantStyle === "INTERMEDIATE" ? "active" : ""
                }`}
                onClick={() => handleAgentTabClick("INTERMEDIATE")}
              >
                <img src={wanda} alt="Wanda" className="agent-img" />
                <span>Wanda</span>
              </div>
            </div>
            <div className="feedback">
              {loading ? (
                <div className="thinking">
                  <p>
                    <em>Aguarde enquanto analiso sua função...</em>
                  </p>
                  <div className="typing-indicator">•••</div>
                </div>
              ) : feedback ? (
                <pre>{typedMessage}</pre>
              ) : (
                <p>Envie sua função e receba um feedback antes de salvá-la</p>
              )}
            </div>
            <div className="container-buttons">
              {feedbackAgentId ? (
                <div className="feedback-reactions">
                  <button
                    className="reaction-button dislike"
                    onClick={handleDislike}
                    title="Deixe um feedback negativo"
                  >
                    <img src={dislike} alt="dislike" />
                  </button>
                  <button
                    className="reaction-button like"
                    onClick={handleLike}
                    title="Deixe um feedback positivo"
                  >
                    <img src={like} alt="like" />
                  </button>
                </div>
              ) : (
                feedbackSent && (
                  <div className="feedback-indicator">
                    Feedback enviado com sucesso!
                  </div>
                )
              )}

              <div className="container-buttons-send">
                <button
                  className="send-button"
                  onClick={handleSubmitFeedback}
                  title="Envia seu código para análise"
                  disabled={!assistantStyle}
                >
                  Feedback
                </button>
                <button
                  className="run-button"
                  onClick={handleRun}
                  title="Executa testes locais na sua função"
                  disabled={!assistantStyle}
                >
                  Run
                </button>
                <button
                  className="submit-button"
                  onClick={handleSubmitFunction}
                  title="Submete sua função final"
                  disabled={!assistantStyle}
                >
                  Submeter
                </button>
              </div>
            </div>
            {successModalOpen && (
              <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                onProceed={handleProceedToFunction2}
                title="Função enviada com sucesso!"
                message="Clique em Avançar para escrever a Função 2."
              />
            )}
          </div>
        </div>
      </div>
      <InstructionsModal
        isOpen={instructionsModalOpen}
        onClose={handleCloseInstructions}
        title="Instruções para Função 1"
      >
        <div className="instructions">
          <p>
            Aqui você vai criar a sua lógica para a <b>função 1</b>, que é
            responsável por escolher sua carta no primeiro round de uma partida!
            Siga as seguintes instruções:
          </p>
          <ul>
            <li>
              Sua função deve se chamar <b>strategy</b>
            </li>
            <li>
              <b>card1, card2, card3:</b> São os parâmetros que representam suas
              cartas nesse round.
            </li>
            <li>
              Suas cartas podem ser: &quot;pedra&quot;, &quot;papel&quot; ou
              &quot;tesoura&quot;.
            </li>
            <li>
              Lembrando que você pode ter cartas repetidas na sua mão, como:
              &quot;pedra&quot;, &quot;pedra&quot; &quot;papel&quot;, por
              exemplo.
            </li>
          </ul>
          <p>
            A função deve retornar uma string que indica a carta a ser jogada
            dentre: &quot;pedra&quot;, &quot;pedra&quot; ou &quot;tesoura&quot;
          </p>
        </div>
      </InstructionsModal>
      <InstructionsModal
        isOpen={agentsModalOpen}
        onClose={handleCloseAgents}
        title="Instruções sobre os agentes"
      >
        <div className="instructions">
          <p>
            Cada agente possui uma “personalidade” distinta na forma como
            elabora suas respostas. Escolha aquele que mais combina com seu
            estilo de aprendizado:
          </p>
          <ul>
            <li>
              <strong>Cosmo:</strong> Mais detalhista nas suas explicações.
            </li>
            <li>
              <strong>Timmy:</strong> vai direto ao ponto, usando
              poucas frases objetivas para destacar apenas o essencial.
            </li>
            <li>
              <strong>Wanda:</strong> equilibra detalhes e
              objetividade, oferecendo explicações claras sem se estender demais.
            </li>
          </ul>

          <h3>Ações disponíveis:</h3>
          <ul>
            <li>
              <strong>Feedback:</strong> envia seu código para que o
              assistente escolhido analise sua função e envie comentários
              personalizados sobre como você está usando os parâmetros da função.
            </li>
            <li>
              <strong>Run:</strong> executa testes na sua função sem
              salvá-la, permitindo validar as saídas da função em situações reais do Jokenpo.
            </li>
            <li>
              <strong>Submeter:</strong> envia sua versão final para
              validação definitiva. Se tudo estiver correto, você seguirá para a
              Função 2.
            </li>
          </ul>
        </div>
      </InstructionsModal>
    </div>
  );
}

export default SendFunctionJokenpo1;
