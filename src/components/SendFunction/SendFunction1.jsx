import { useState, useContext, useEffect } from "react";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import "./SendFunction.css";
import AuthContext from "../../context/AuthContext";
import cosmo from "../../assets/cosmo-avatar.png";
import like from "../../assets/like.svg";
import dislike from "../../assets/dislike.svg";
import InstructionsModal from "./InstructionsModal";

function SendFunction1() {
  const defaultCode =
    "def strategy(card1, card2, card3):";
  const [text, setText] = useState(defaultCode);
  const [feedback, setFeedback] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState(null);
  const [feedbackAgentId, setFeedbackAgentId] = useState(null);
  const { token } = useContext(AuthContext);

  const [assistantStyle, setAssistantStyle] = useState("VERBOSE");

  // Atualiza o agente selecionado
  const handleAgentTabClick = (agent) => {
    setAssistantStyle(agent);
    console.log("Mudando agente para:", agent);
  };

  // Carregar função salva ao montar o componente
  useEffect(() => {
    async function fetchSavedFunction() {
      try {
        const url = "http://localhost:8080/jokenpo/function";
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200 && response.data && response.data.code) {
          setText(response.data.code);
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

  // Efeito de digitação para exibir o feedback
  useEffect(() => {
    if (!feedback) {
      setTypedMessage("");
      return;
    }
    const msg = feedback.message;
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
      const { feedback: feedbackMessage, valid } = response.data;
      setFeedback({ message: feedbackMessage, valid });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro ao submeter a função.";
      setFeedback({ message: errorMessage, valid: false });
    } finally {
      setLoading(false);
    }
  };

  // Função do botão "Run"
  const handleRun = () => {
    console.log("Run clicked: poderia rodar testes de saída aqui.");
  };

  // Enviar feedback do usuário (like)
  const handleLike = async () => {
    console.log("like clicked!");
    setUserFeedback("like");
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
    } catch (error) {
      console.error("Erro ao enviar feedback (like):", error);
    }
  };

  // Enviar feedback do usuário (dislike)
  const handleDislike = async () => {
    console.log("dislike clicked!");
    setUserFeedback("dislike");
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
    } catch (error) {
      console.error("Erro ao enviar feedback (dislike):", error);
    }
  };

  // Controle do modal de instruções
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const handleOpenInstructions = () => {
    setInstructionsModalOpen(true);
  };
  const handleCloseInstructions = () => {
    setInstructionsModalOpen(false);
  };

  return (
    <div className="container-sendfunction">
      <div className="top-section">
        <div className="informations-section">
          <h1>Escreva seu código da função 1!</h1>
          <button onClick={handleOpenInstructions}>Instruções</button>
        </div>
        <div className="editor-feedback-container">
          {/* Editor de Código */}
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
          {/* Área de Feedback e Seleção dos Agentes */}
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
                <img src={cosmo} alt="Timmy" className="agent-img" />
                <span>Timmy</span>
              </div>
              <div
                className={`agent-tab ${
                  assistantStyle === "INTERMEDIATE" ? "active" : ""
                }`}
                onClick={() => handleAgentTabClick("INTERMEDIATE")}
              >
                <img src={cosmo} alt="Wanda" className="agent-img" />
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
              {feedbackAgentId && (
                <div className="feedback-reactions">
                  <button
                    className={`reaction-button dislike ${
                      userFeedback === "dislike" ? "selected" : ""
                    }`}
                    onClick={handleDislike}
                  >
                    <img src={dislike} alt="dislike" />
                  </button>
                  <button
                    className={`reaction-button like ${
                      userFeedback === "like" ? "selected" : ""
                    }`}
                    onClick={handleLike}
                  >
                    <img src={like} alt="like" />
                  </button>
                </div>
              )}
              <div className="container-buttons-send">
                <button className="run-button" onClick={handleRun}>
                  Run
                </button>
                <button className="send-button" onClick={handleSubmitFeedback}>
                  Feedback
                </button>
                <button
                  className="submit-button"
                  onClick={handleSubmitFunction}
                >
                  Submeter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstructionsModal
        isOpen={instructionsModalOpen}
        onClose={handleCloseInstructions}
      />
    </div>
  );
}

export default SendFunction1;
