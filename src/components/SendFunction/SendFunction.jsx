import { useState, useContext, useEffect } from "react";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import "./SendFunction.css";
import AuthContext from "../../context/AuthContext";
import cosmo from "../../assets/cosmo-avatar.png";
import InstructionsModal from "./InstructionsModal";

function SendFunction() {
  // Guardando a assinatura inicial da função
  const defaultCode =
    "def strategy(card1, card2, card3, opponentCard1, opponentCard2, opponentCard3):";
  const [text, setText] = useState(defaultCode);
  // Estado para feedback: { message, valid }
  const [feedback, setFeedback] = useState(null);
  // Estado para o efeito de digitação
  const [typedMessage, setTypedMessage] = useState("");
  // Estado de loading para requisições
  const [loading, setLoading] = useState(false);
  // Estado para indicar se a função já está salva (exibida no editor)
  const [functionLoaded, setFunctionLoaded] = useState(false);

  const { token } = useContext(AuthContext);

  const [assistantStyle, setAssistantStyle] = useState("VERBOSE");

  const handleStyleChange = (e) => {
    setAssistantStyle(e.target.value);
  };

  let assistantName;
  switch (assistantStyle) {
    case "VERBOSE":
      assistantName = "Cosmo Verboso";
      break;
    case "SUCCINCT":
      assistantName = "Cosmo Direto";
      break;
    case "INTERMEDIATE":
      assistantName = "Cosmo Equilibrado";
      break;
    default:
      assistantName = "Cosmo Desconhecido";
  }

  // useEffect para carregar a função salva (se existir) quando a página abre
  useEffect(() => {
    async function fetchSavedFunction() {
      try {
        const url = "http://localhost:8080/jokenpo/function"; // Mudar a rota
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Se a função estiver salva, atualiza o editor com ela
        if (response.status === 200 && response.data && response.data.code) {
          setText(response.data.code);
          setFunctionLoaded(true);
        }
      } catch (error) {
        // Se retornar 404 (ou outro erro), mantemos o código padrão
        if (error.response && error.response.status === 404) {
          setText(defaultCode);
        } else {
          console.error("Erro ao buscar função salva:", error);
        }
      }
    }

    fetchSavedFunction();
  }, [token, defaultCode]);

  // useEffect para o efeito de digitação no feedback
  useEffect(() => {
    // Se não há feedback ou feedback.message vazio, limpa typedMessage
    if (!feedback?.message) {
      setTypedMessage("");
      return;
    }

    const msg = feedback.message;
    let i = -1;
    setTypedMessage("   "); // Começa do zero

    const intervalId = setInterval(() => {
      if (i < msg.length - 1) {
        // Adiciona o caractere i da string
        setTypedMessage((prev) => prev + msg[i]);
        i++;
      } else {
        // Já exibimos tudo, limpamos intervalo
        clearInterval(intervalId);
      }
    }, 30);

    // Limpar interval caso componente desmonte ou feedback mude de repente
    return () => clearInterval(intervalId);
  }, [feedback]);

  // Função que lida com a requisição de "Feedback"
  const handleSubmitFeedback = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const url = "http://localhost:8080/jokenpo/feedback";
      const requestBody = { code: text, assistantStyle: assistantStyle };
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Supomos que a resposta tem o formato { feedback: string, valid: boolean }
      const { feedback: feedbackMessage, valid } = response.data;
      setFeedback({ message: feedbackMessage, valid: valid });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro desconhecido ao enviar a função.";
      setFeedback({ message: errorMessage, valid: false });
    } finally {
      setLoading(false);
    }
  };

  // Função esboço para "Submeter" a função salva no backend
  const handleSubmitFunction = async () => {
    try {
      const url = "http://localhost:8080/jokenpo";
      const requestBody = { code: text };
      await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setFeedback({
        message: "Parabéns! Sua função foi submetida com sucesso!",
        valid: true,
      });
    } catch (error) {
      // Extrai a mensagem de erro do backend (campo "error")
      const errorMessage =
        error.response?.data?.error || "Erro ao submeter a função.";
      setFeedback({ message: errorMessage, valid: false });
    }
  };

  // Novo estado para controlar o modal de instruções
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);

  // Função para abrir o modal de instruções
  const handleOpenInstructions = () => {
    setInstructionsModalOpen(true);
  };

  // Função para fechar o modal de instruções
  const handleCloseInstructions = () => {
    setInstructionsModalOpen(false);
  };

  return (
    <div className="container-sendfunction">
      <div className="top-section">
        <div className="informations-section">
          <h1>Escreva seu código</h1>
          <button onClick={handleOpenInstructions}>Instruções</button>
        </div>
        <div className="editor-feedback-container">
          {/* Editor de Código (Esquerda) */}
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
          {/* Área de Feedback (Direita) */}
          <div className="feedback-space">
            <div className="assistant-avatar">
              <img src={cosmo} alt={assistantName} />
              <span>{assistantName}</span>
              <select
                id="assistantStyle"
                value={assistantStyle}
                onChange={handleStyleChange}
              >
                <option value="VERBOSE">Cosmo Verboso</option>
                <option value="SUCCINCT">Cosmo Direto</option>
                <option value="INTERMEDIATE">Cosmo Equilibrado</option>
              </select>
            </div>
            <div className="feedback">
              {loading ? (
                <div className="thinking">
                  <p>
                    <em>Cosmo está pensando...</em>
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
              <button className="send-button" onClick={handleSubmitFeedback}>
                Feedback
              </button>
              {feedback && feedback.valid && (
                <button className="send-button" onClick={handleSubmitFunction}>
                  Submeter
                </button>
              )}
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

export default SendFunction;
