import { useState } from "react";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import "./SendFunction.css"

function SendFunction() {
  const [text, setText] = useState(
    "def strategy(card1, card2, card3, opponentCard1, opponentCard2, opponentCard3):"
  ); // Função enviada
  const [feedback, setFeedback] = useState(null); // Mensagem do backend

  const handleSubmit = async () => {
    try {
      // URL do backend
      const url = "http://localhost:8080/jokenpo";

      // Corpo da requisição
      const requestBody = {
        code: text, // Código do CodeMirror
      };

      // Realiza a requisição POST - preciso lembrar de ajeitar opra enviar o token
      const response = await axios.post(url, requestBody);

      // Caso a função seja aceita, exibe o código retornado pelo backend
      setFeedback({
        type: "success",
        message: `Função aceita:\n${response.data.code}`,
      });
    } catch (error) {
      // Verifica se o erro possui o campo "error" e exibe
      const errorMessage =
        error.response?.data?.error || "Erro desconhecido ao enviar a função.";
      setFeedback({ type: "error", message: errorMessage });
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
              jogada, por exemplo: &quot;pedra&quot;, &quot;papel&quot; e &quot;tesoura&quot;
            </p>
          </div>

          {/* Botão de Enviar */}
          <button className="send-button" onClick={handleSubmit}>
            Enviar Função
          </button>
        </div>
      </div>
      <div className="feedback-space">
        <h3>Área do Feedback</h3>
        <p>Envie sua função e receba um feedback antes de salvá-la</p>
        <div className="feedback">
          {feedback ? (
            feedback.type === "success" ? (
              <pre>{feedback.message}</pre> // Usa <pre> para preservar o formato do código
            ) : (
              <p>{feedback.message}</p> // Para erros, mantém o <p>
            )
          ) : (
            "O feedback do backend será exibido aqui."
          )}
        </div>
      </div>
    </div>
  );
}

export default SendFunction;
