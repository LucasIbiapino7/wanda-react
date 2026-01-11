import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";

import "./SendFunctionBits.css";

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
import api from "../../../services/api.js";

const GAME = "BITS";
const FUNCTION_DB_NAME = "bits";

const ACTION_HINTS = {
  feedback: {
    label: "Feedback",
    hint: "Análise semântica do seu código, sem rodar partidas.",
  },
  run: {
    label: "Run",
    hint: "Executa testes locais com seu código atual (sem salvar).",
  },
  submit: {
    label: "Submeter",
    hint: "Valida e salva sua função para uso em duelos/torneios.",
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

export default function SendFunctionBits() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const defaultCode ="def strategy(bit8, bit16, bit32, firewall, opp_last):";
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

  // agente escolhido + nudge visual
  const [assistantStyle, setAssistantStyle] = useState(null);
  const [showAgentNudge, setShowAgentNudge] = useState(false);

  const handleAgentTabClick = (agent) => {
    if (isProcessing) return;
    setAssistantStyle(agent);
    localStorage.setItem("selectedAgentBits", agent);
  };

  // restaura agente selecionado
  useEffect(() => {
    const last = localStorage.getItem("selectedAgentBits");
    if (last) setAssistantStyle(last);
  }, []);

  // carrega função salva (BITS) via GET /api/function?gameName=bits
  useEffect(() => {
    async function fetchSavedFunction() {
      try {
        const { data } = await api.get("/api/function", {
          params: { gameName: FUNCTION_DB_NAME },
          skipAuth: false,
        });

        if (data?.code) {
          setText(data.code);
          setHasSavedFunction(true);
        } else {
          setText(defaultCode);
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
  }, [token]);

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
    functionName: FUNCTION_DB_NAME,
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
  const [hoveredAction, setHoveredAction] = useState(null);

  const processingText = {
    feedback: "Analisando seu código…",
    run: "Executando testes…",
    submit: "Validando e salvando sua função…",
  };

  const currentHint =
    isProcessing && runningAction
      ? processingText[runningAction] || ""
      : hoveredAction
      ? ACTION_HINTS[hoveredAction].hint
      : "Passe o mouse (ou use Tab) sobre um botão para saber o que ele faz.";
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpTab, setHelpTab] = useState("instructions"); 

  const openHelp = (tab = "instructions") => {
    setHelpTab(tab);
    setHelpModalOpen(true);
  };

  return (
    <div className="container-sendfunction">
      <div className="top-section">
        <div className="informations-section">
          <h1>BITS — Estratégia</h1>

          <div className="progress-indicator">
            <span>strategy</span>
          </div>

          <div className="informations-section-buttons">
            <button
              className="help-button"
              type="button"
              onClick={() => openHelp("instructions")}
              title="Abrir ajuda"
              disabled={isProcessing}
            >
              Ajuda
            </button>

            {hasSavedFunction && (
              <button
                className="next-function-button"
                onClick={() => navigate("/challenges")}
                title="Clique para desafiar seus amigos"
                disabled={isProcessing}
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

            <HintBox text={currentHint} />

            {successModalOpen && (
              <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                onProceed={() => navigate("/challenges")}
                title="Função enviada com sucesso!"
                message="Parabéns! Agora você pode desafiar seus amigos."
              />
            )}
          </div>
        </div>
      </div>

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
      <InstructionsModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="Ajuda — BITS"
        footer={
          <div className="help-footer-tabs">
            <button
              type="button"
              className={`help-tab-btn ${
                helpTab === "instructions" ? "active" : ""
              }`}
              onClick={() => setHelpTab("instructions")}
            >
              Instruções
            </button>
            <button
              type="button"
              className={`help-tab-btn ${helpTab === "agents" ? "active" : ""}`}
              onClick={() => setHelpTab("agents")}
            >
              Agentes
            </button>
          </div>
        }
      >
        {helpTab === "instructions" ? (
          <div className="instructions">
            <p>
              Aqui você cria a lógica da função <b>strategy</b> do BITS. A cada
              rodada, sua função decide qual carta jogar.
            </p>

            <ul>
              <li>
                Sua função deve se chamar <b>strategy</b>.
              </li>
              <li>
                Parâmetros: <b>bit8</b>, <b>bit16</b>, <b>bit32</b>,{" "}
                <b>firewall</b> são representados por 0 (você já não tem essa carta) ou 1 (você ainda tem essa carta), enquanto <b>opp_last</b> pode ser None ou um dos valores de retorno.
              </li>
              <li>
                Você deve retornar uma string dentre: <b>&quot;BIT8&quot;</b>,{" "}
                <b>&quot;BIT16&quot;</b>, <b>&quot;BIT32&quot;</b> ou{" "}
                <b>&quot;FIREWALL&quot;</b>.
              </li>
            </ul>

            <p>
              Dica: comece com regras simples e depois evolua analisando padrões
              do oponente.
            </p>
          </div>
        ) : (
          <div className="instructions">
            <p>Cada agente possui uma “personalidade” distinta:</p>
            <ul>
              <li>
                <strong>Cosmo:</strong> mais detalhista.
              </li>
              <li>
                <strong>Timmy:</strong> direto ao ponto.
              </li>
              <li>
                <strong>Wanda:</strong> equilíbrio.
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
        )}
      </InstructionsModal>
    </div>
  );
}
