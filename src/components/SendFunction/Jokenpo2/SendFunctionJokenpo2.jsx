import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import "./SendFunctionJokenpo2.css";
import AuthContext from "../../../context/AuthContext";
import cosmo from "../../../assets/cosmo-avatar.png";
import timmy from "../../../assets/timmy.png";
import wanda from "../../../assets/wanda.png";
import like from "../../../assets/like.svg";
import dislike from "../../../assets/dislike.svg";
import InstructionsModal from "../InstructionsModal";
import SuccessModal from "../SuccessModal";
import FunctionService from "../../../services/FunctionService.js";
import AppModal from "../../UI/AppModal.jsx";
import HintBox from "../../UI/HintBox.jsx";

const GAME = "jokenpo";
const FUNCTION = "jokenpo2";

const ACTION_HINTS = {
  feedback: {
    label: "Feedback",
    hint: "Análise semântica do seu código, sem rodar testes.",
  },
  run: {
    label: "Run",
    hint: "Executa testes locais com seu código atual.",
  },
  submit: {
    label: "Submeter",
    hint: "Valida e salva sua função para uso nos torneios.",
  },
};

function extractApiError(err) {
  const status = err?.response?.status ?? err?.normalized?.status ?? 0;
  const data = err?.response?.data;
  const backendMsg = data?.error || data?.message;
  const normalizedMsg = err?.normalized?.message;
  const message =
    backendMsg ||
    normalizedMsg ||
    (status === 0
      ? "Falha de conexão. Tente novamente."
      : "Não consegui concluir sua solicitação. Tente mais tarde.");
  return { status, message };
}

function SendFunctionJokenpo2() {
  const navigate = useNavigate();

  const defaultCode =
    "def strategy(card1, card2, opponentCard1, opponentCard2):";
  const [text, setText] = useState(defaultCode);
  const [feedback, setFeedback] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // processamento global e ação corrente
  const [isProcessing, setIsProcessing] = useState(false);
  const [runningAction, setRunningAction] = useState(null);

  // id do feedback do agente (para like/dislike) e confirmação
  const [feedbackAgentId, setFeedbackAgentId] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // estado de função salva / sucesso
  const [hasSavedFunction, setHasSavedFunction] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const { token } = useContext(AuthContext);

  // agente escolhido + nudge visual
  const [assistantStyle, setAssistantStyle] = useState(null);
  const [showAgentNudge, setShowAgentNudge] = useState(false);

  const handleAgentTabClick = (agent) => {
    if (isProcessing) return;
    setAssistantStyle(agent);
    localStorage.setItem("selectedAgent2", agent);
  };

  // welcome/tour: não usado aqui

  // restaura agente selecionado
  useEffect(() => {
    const last = localStorage.getItem("selectedAgent2");
    if (last) setAssistantStyle(last);
  }, []);

  // carrega função salva
  useEffect(() => {
    async function fetchSavedFunction() {
      try {
        const data = await FunctionService.getSaved(FUNCTION);
        if (data?.code) {
          setText(data.code);
          setHasSavedFunction(true);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setText(defaultCode);
        } else {
          const { status, message } = extractApiError(error);
          setModal({
            open: true,
            title:
              status === 0
                ? "Falha de conexão"
                : status >= 500
                ? "Erro no servidor"
                : "Não foi possível carregar",
            message,
            variant: "error",
          });
        }
      }
    }
    if (token) fetchSavedFunction();
  }, [token, defaultCode]);

  // efeito de digitação do feedback
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

  // garante agente
  const ensureAgent = () => {
    if (!assistantStyle) {
      setShowAgentNudge(true);
      setTimeout(() => setShowAgentNudge(false), 1800);
      return false;
    }
    return true;
  };

  const commonBody = () => ({
    code: text,
    assistantStyle,
    functionName: FUNCTION,
    gameName: GAME,
  });

  // FEEDBACK
  const handleSubmitFeedback = async () => {
    if (!ensureAgent()) return;
    setIsProcessing(true);
    setRunningAction("feedback");
    setLoading(true);
    setFeedback(null);
    setFeedbackAgentId(null);
    setFeedbackSent(false);
    try {
      const data = await FunctionService.feedback(commonBody());
      setFeedbackAgentId(data.feedbackId);
      setFeedback(data.feedback);
    } catch (err) {
      const { status, message } = extractApiError(err);
      let title = "Não conseguimos concluir sua solicitação";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";
      setModal({ open: true, title, message, variant: "error" });
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setRunningAction(null);
    }
  };

  // Run
  const handleRun = async () => {
    if (!ensureAgent()) return;
    setIsProcessing(true);
    setRunningAction("run");
    setLoading(true);
    setFeedback(null);
    setFeedbackAgentId(null);
    setFeedbackSent(false);

    try {
      const data = await FunctionService.run(commonBody());
      setFeedbackAgentId(data.feedbackId);
      setFeedback(data.feedback);
    } catch (err) {
      const { status, message } = extractApiError(err);
      let title = "Não conseguimos concluir sua solicitação";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";
      setModal({ open: true, title, message, variant: "error" });
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setRunningAction(null);
    }
  };

  // SUBMIT
  const handleSubmitFunction = async () => {
    if (!ensureAgent()) return;
    setIsProcessing(true);
    setRunningAction("submit");
    setLoading(true);
    setFeedback(null);
    setFeedbackAgentId(null);
    setFeedbackSent(false);

    try {
      const data = await FunctionService.submit(commonBody());
      setFeedbackAgentId(data.feedbackId);
      setFeedback(data.feedback);

      if (data.valid) {
        setSuccessModalOpen(true);
        setHasSavedFunction(true);
      }
    } catch (err) {
      const { status, message } = extractApiError(err);
      let title = "Não conseguimos concluir sua solicitação";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";
      setModal({ open: true, title, message, variant: "error" });
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setRunningAction(null);
    }
  };

  // like/dislike do feedback do agente
  const handleLike = async () => {
    try {
      await FunctionService.sendUserFeedback({
        feedbackId: feedbackAgentId,
        feedbackUser: "like",
      });
      setFeedbackAgentId(null);
      setFeedbackSent(true);
    } catch (error) {
      const { status, message } = extractApiError(error);
      let title = "Não conseguimos enviar seu feedback";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";
      setModal({ open: true, title, message, variant: "error" });
    }
  };
  const handleDislike = async () => {
    try {
      await FunctionService.sendUserFeedback({
        feedbackId: feedbackAgentId,
        feedbackUser: "dislike",
      });
      setFeedbackAgentId(null);
      setFeedbackSent(true);
    } catch (error) {
      const { status, message } = extractApiError(error);
      let title = "Não conseguimos enviar seu feedback";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";
      setModal({ open: true, title, message, variant: "error" });
    }
  };

  // rótulos dinâmicos dos botões
  const labelFor = (key) => {
    if (runningAction !== key)
      return { feedback: "Feedback", run: "Run", submit: "Submeter" }[key];
    return { feedback: "Analisando…", run: "Testando…", submit: "Validando…" }[
      key
    ];
  };

  const agentName =
    assistantStyle === "VERBOSE"
      ? "Cosmo"
      : assistantStyle === "SUCCINCT"
      ? "Timmy"
      : assistantStyle === "INTERMEDIATE"
      ? "Wanda"
      : null;

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // estado de hover/focus para decidir o texto do HintBox
  const [hoveredAction, setHoveredAction] = useState(null); // "feedback" | "run" | "submit" | null

  // textos de status quando processando (para o HintBox)
  const processingText = {
    feedback: "Analisando seu código…",
    run: "Executando testes…",
    submit: "Validando e salvando sua função…",
  };

  // cálculo do texto do HintBox (prioridade: processamento > hover > neutro)
  const currentHint =
    isProcessing && runningAction
      ? processingText[runningAction] || ""
      : hoveredAction
      ? ACTION_HINTS[hoveredAction].hint
      : "Passe o mouse (ou use Tab) sobre um botão para saber o que ele faz.";

  // --- Dropdown “Ajuda ▾” (hover + clique para manter aberto)
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!helpRef.current) return;
      if (!helpRef.current.contains(e.target)) setHelpOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setHelpOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // modais informativos
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const handleOpenInstructions = () => setInstructionsModalOpen(true);
  const handleCloseInstructions = () => setInstructionsModalOpen(false);

  const [agentsModalOpen, setAgentsModalOpen] = useState(false);
  const handleOpenAgents = () => setAgentsModalOpen(true);
  const handleCloseAgents = () => setAgentsModalOpen(false);

  return (
    <div className="container-sendfunction">
      <div className="top-section">
        <div className="informations-section">
          <h1>Função 2 – Sua Estratégia no Round 2</h1>
          <div className="progress-indicator">
            <span>Passo 2 de 2</span>
          </div>
          <div className="informations-section-buttons">
            <div
              ref={helpRef}
              className={`help-dropdown ${helpOpen ? "is-open" : ""}`}
              onMouseEnter={() => setHelpOpen(true)}
              onMouseLeave={() => setHelpOpen(false)}
            >
              <button
                className="help-button"
                onClick={() => setHelpOpen((v) => !v)}
                aria-expanded={helpOpen}
                aria-haspopup="true"
              >
                Ajuda ▾
              </button>
              <div className="help-menu" role="menu">
                <button onClick={handleOpenInstructions} role="menuitem">
                  Instruções
                </button>
                <button onClick={handleOpenAgents} role="menuitem">
                  Agentes
                </button>
              </div>
            </div>

            {hasSavedFunction && (
              <button
                className="next-function-button"
                onClick={() => setSuccessModalOpen(true)}
                title="Clique para desafiar seus amigos"
              >
                Desafie seus amigos!
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

          <div className="feedback-space" aria-busy={isProcessing}>
            {!assistantStyle && (
              <div className="agent-banner" role="note">
                <strong>Escolha um agente</strong> para usar Feedback, Run ou
                Submeter.
              </div>
            )}

            <div className="agent-tabs">
              <div
                className={`agent-tab ${
                  assistantStyle === "VERBOSE" ? "active" : ""
                } ${isProcessing ? "disabled" : ""}`}
                onClick={() => handleAgentTabClick("VERBOSE")}
                title={
                  isProcessing
                    ? "Aguarde o processamento terminar"
                    : "Selecionar Cosmo"
                }
              >
                <img src={cosmo} alt="Cosmo" className="agent-img" />
                <span>Cosmo</span>
              </div>
              <div
                className={`agent-tab ${
                  assistantStyle === "SUCCINCT" ? "active" : ""
                } ${isProcessing ? "disabled" : ""}`}
                onClick={() => handleAgentTabClick("SUCCINCT")}
                title={
                  isProcessing
                    ? "Aguarde o processamento terminar"
                    : "Selecionar Timmy"
                }
              >
                <img src={timmy} alt="Timmy" className="agent-img" />
                <span>Timmy</span>
              </div>
              <div
                className={`agent-tab ${
                  assistantStyle === "INTERMEDIATE" ? "active" : ""
                } ${isProcessing ? "disabled" : ""}`}
                onClick={() => handleAgentTabClick("INTERMEDIATE")}
                title={
                  isProcessing
                    ? "Aguarde o processamento terminar"
                    : "Selecionar Wanda"
                }
              >
                <img src={wanda} alt="Wanda" className="agent-img" />
                <span>Wanda</span>
              </div>
            </div>

            {showAgentNudge && (
              <div className="agent-nudge" role="alert">
                Selecione um agente para continuar ↑
              </div>
            )}

            {/* Área de feedback */}
            <div className="feedback">
              {isProcessing ? (
                <div className="thinking">
                  <p>
                    <em>
                      {agentName
                        ? `${agentName} está analisando…`
                        : "Processando…"}
                    </em>
                  </p>
                  <div className="typing-indicator">•••</div>
                </div>
              ) : feedback ? (
                <pre>{typedMessage}</pre>
              ) : (
                <p>Escolha um agente para usar Feedback, Run ou Submeter.</p>
              )}
            </div>

            <div className="container-buttons">
              {feedbackAgentId ? (
                <div className="feedback-reactions">
                  <button
                    className="reaction-button dislike"
                    onClick={handleDislike}
                    title="Deixe um feedback negativo"
                    disabled={isProcessing}
                  >
                    <img src={dislike} alt="dislike" />
                  </button>
                  <button
                    className="reaction-button like"
                    onClick={handleLike}
                    title="Deixe um feedback positivo"
                    disabled={isProcessing}
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
                  title={
                    assistantStyle
                      ? "Envia seu código para análise"
                      : "Selecione um agente"
                  }
                  disabled={!assistantStyle || isProcessing}
                  onMouseEnter={() => setHoveredAction("feedback")}
                  onMouseLeave={() => setHoveredAction(null)}
                  onFocus={() => setHoveredAction("feedback")}
                  onBlur={() => setHoveredAction(null)}
                >
                  {labelFor("feedback")}
                </button>
                <button
                  className="run-button"
                  onClick={handleRun}
                  title={
                    assistantStyle
                      ? "Executa testes locais na sua função"
                      : "Selecione um agente"
                  }
                  disabled={!assistantStyle || isProcessing}
                  onMouseEnter={() => setHoveredAction("run")}
                  onMouseLeave={() => setHoveredAction(null)}
                  onFocus={() => setHoveredAction("run")}
                  onBlur={() => setHoveredAction(null)}
                >
                  {labelFor("run")}
                </button>
                <button
                  className="submit-button"
                  onClick={handleSubmitFunction}
                  title={
                    assistantStyle
                      ? "Submete sua função final"
                      : "Selecione um agente"
                  }
                  disabled={!assistantStyle || isProcessing}
                  onMouseEnter={() => setHoveredAction("submit")}
                  onMouseLeave={() => setHoveredAction(null)}
                  onFocus={() => setHoveredAction("submit")}
                  onBlur={() => setHoveredAction(null)}
                >
                  {labelFor("submit")}
                </button>
              </div>
            </div>

            {/* bloco de dica reutilizável abaixo dos botões */}
            <HintBox text={currentHint} />

            {successModalOpen && (
              <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                onProceed={() => navigate("/challenges")}
                title="Função 2 enviada com sucesso!"
                message="Parabéns! Agora você pode desafiar seus amigos."
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal padronizado (igual ao Challenge) */}
      <AppModal
        open={modal.open}
        onClose={closeModal}
        title={modal.title}
        variant={modal.variant}
        primaryAction={{ id: "modal-ok", label: "Ok", onClick: closeModal }}
        initialFocus="modal-ok"
      >
        <p>{modal.message}</p>
      </AppModal>

      {/* Modal de INSTRUÇÕES — mesmas frases do 2 e rodapé com link para Agentes */}
      <InstructionsModal
        isOpen={instructionsModalOpen}
        onClose={handleCloseInstructions}
        title="Instruções para Função 2"
        footer={
          <button
            className="footer-link"
            onClick={() => {
              handleCloseInstructions(); // fecha Instruções
              handleOpenAgents();        // abre Agentes
            }}
          >
            Ver informações dos agentes →
          </button>
        }
      >
        <div className="instructions">
          <p>
            Aqui você vai criar a sua lógica para a <b>função 2</b>, que é
            responsável por escolher sua carta no segundo round de uma partida!
          </p>
          <ul>
            <li>
              Sua função deve se chamar <b>strategy</b>
            </li>
            <li>
              <b>card1, card2:</b> São os parâmetros que representam suas cartas
              nesse round.
            </li>
            <li>
              <b>opponentCard1, opponentCard2:</b> São os parâmetros que
              representam as cartas do seu oponente nesse round.
            </li>
            <li>Suas cartas podem ser: “pedra”, “papel” ou “tesoura”.</li>
          </ul>
          <p>
            A função deve retornar uma string que indica a carta a ser jogada
            dentre: “pedra”, “papel” ou “tesoura”.
          </p>
        </div>
      </InstructionsModal>

      {/* Modal de AGENTES — mesmas frases e rodapé com link de volta */}
      <InstructionsModal
        isOpen={agentsModalOpen}
        onClose={handleCloseAgents}
        title="Instruções sobre os agentes"
        footer={
          <button
            className="footer-link"
            onClick={() => {
              handleCloseAgents();       // fecha Agentes
              handleOpenInstructions();  // abre Instruções
            }}
          >
            ← Voltar às instruções
          </button>
        }
      >
        <div className="instructions">
          <p>
            Cada agente possui uma “personalidade” distinta na forma como
            elabora suas respostas:
          </p>
          <ul>
            <li>
              <strong>Cosmo:</strong> mais detalhista.
            </li>
            <li>
              <strong>Timmy:</strong> direto ao ponto.
            </li>
            <li>
              <strong>Wanda:</strong> equilíbrio entre detalhes e objetividade.
            </li>
          </ul>
          <h3>Ações:</h3>
          <ul>
            <li>
              <strong>Feedback:</strong> análise semântica do seu código.
            </li>
            <li>
              <strong>Run:</strong> executa testes sem salvar.
            </li>
            <li>
              <strong>Submeter:</strong> valida e salva sua função.
            </li>
          </ul>
        </div>
      </InstructionsModal>
    </div>
  );
}

export default SendFunctionJokenpo2;
