import { useState, useContext, useEffect, useRef } from "react";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import "./SendFunction.css";
import AuthContext from "../../context/AuthContext";
import cosmo from "../../assets/cosmo-avatar.png";

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

  const feedbackRef = useRef(null);

  const { token } = useContext(AuthContext);

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
    // Rolagem suave para a seção de feedback:
    if (feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth" });
    }
    try {
      const url = "http://localhost:8080/jokenpo/feedback";
      const requestBody = { code: text };
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
    if (feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

  return (
    <div className="container">
      <div className="top-section">
        {/* Editor de Código (Esquerda) */}
        <div className="editor-section">
          <h1 className="title">Editor de Código</h1>
          <CodeMirror
            value={text}
            onChange={(newValue) => setText(newValue)}
            theme={dracula}
            extensions={[python()]}
            basicSetup={{ autocompletion: true, indentUnit: "    " }}
            minWidth={"100%"}
            minHeight={"500px"}
          />
        </div>

        {/* Instruções e Feedback (Direita) */}
        <div className="info-section">
          <div className="instructions">
            <h2>Instruções para criar sua função</h2>
            <p>
              Sua função deve se chamar <b>Strategy</b> e vai receber os
              seguintes parâmetros:
            </p>
            <ul>
              <li>
                <b>card1, card2, card3:</b> suas cartas disponíveis, podendo
                ser: pedra, papel, tesoura ou None (Caso a carta já tenha sido
                usada).
              </li>
              <li>
                <b>opponentCard1, opponentCard2, opponentCard3:</b> Cartas do
                oponente disponíveis podendo ser: pedra, papel, tesoura ou None
                (Caso a carta já tenha sido usada).
              </li>
            </ul>
            <p>
              A função deve retornar uma String que indica a carta que vai ser
              jogada, por exemplo: &quot;pedra&quot;, &quot;papel&quot; e
              &quot;tesoura&quot;
            </p>
          </div>

          {/* Botões: "Feedback" sempre visível; "Submeter" só se feedback.valid === true */}
          <div className="container-buttons">
            <button className="send-button" onClick={handleSubmitFeedback}>
              Feedback
            </button>
            {/* Exibe o botão "Submeter" somente se feedback for definido e valid === true */}
            {feedback && feedback.valid && (
              <button className="send-button" onClick={handleSubmitFunction}>
                Submeter
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="feedback-space" ref={feedbackRef}>
        <div className="assistant-avatar">
          <img src={cosmo} alt="Cosmo" />
          <span>Cosmo, seu Assistente Virtual</span>
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
      </div>
    </div>
  );
}

export default SendFunction;
