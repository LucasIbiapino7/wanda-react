import { useState, useEffect, useContext, useCallback } from "react";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./OpenTournaments.css";
import LockIcon from "../../assets/lock.svg";
import PublicIcon from "../../assets/public.svg";
import TournamentService from "../../services/TournamentService";
import AppModal from "../UI/AppModal";

const GAME_LOGOS = {
  jokenpo: "/assets/games/jokenpo-logo.png",
  bits: "/assets/games/bits-logo.png",
};

export default function OpenTournaments() {
  const { token } = useContext(AuthContext);

  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const extractApiError = (err) => {
    const data = err?.response?.data;
    const backendMsg = data?.error || data?.message;
    const normalizedMsg =
      err?.normalized?.message || "Ocorreu um erro ao processar sua solicitação.";
    return backendMsg || normalizedMsg;
  };

  const fetchTournaments = useCallback(
    async (pageNum = 0) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const data = await TournamentService.getOpen({ page: pageNum, size: 5 });
        setTournaments(data?.content ?? []);
        setTotalPages(data?.totalPages ?? 0);

        // importante: a página do estado passa a ser "a fonte de verdade"
        setPage(pageNum);
      } catch (err) {
        console.error("Erro ao carregar torneios:", err);
        setError("Não foi possível carregar os torneios no momento.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // carrega quando o token chega e quando a página muda
  useEffect(() => {
    if (token) fetchTournaments(page);
  }, [token, page, fetchTournaments]);

  const handleSubscribe = async (tournamentId) => {
    try {
      await TournamentService.subscribe(tournamentId);

      setModal({
        open: true,
        title: "Inscrição confirmada",
        message: "Você entrou no torneio com sucesso!",
        variant: "success",
      });

      // atualiza a lista na mesma página
      fetchTournaments(page);
    } catch (err) {
      const msg = extractApiError(err);
      setModal({
        open: true,
        title: "Erro ao entrar no torneio",
        message: msg,
        variant: "error",
      });
    }
  };

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const renderCountdown = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start - now;
    if (diffMs <= 0) return "Já começou";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);

    return `${days}d ${hrs}h ${mins}m`;
  };

  return (
    <div className="open-tournaments">
      <h2 className="section-title">Torneios Abertos</h2>

      {loading && <p className="loading">Carregando torneios...</p>}
      {error && <p className="error">{error}</p>}

      <div className="tournaments-grid">
        {tournaments.map((t) => {
          const full = t.currentParticipants >= t.maxParticipants;

          const gameKey = String(t.game?.name || "").toLowerCase().trim();
          const gameLogo = GAME_LOGOS[gameKey] || null;

          return (
            <div key={t.id} className="tournament-card">
              {/* ===== Cabeçalho ===== */}
              <div className="card-header">
                <div className="card-header-info">
                  <h4 className="card-title">{t.name}</h4>
                  <p className="creator-name">
                    Criado por: <strong>{t.creator?.name}</strong>
                  </p>
                </div>

                <div className="card-badges">
                  <span className="badge-status">{t.status}</span>
                  <img
                    src={t.asPrivate ? LockIcon : PublicIcon}
                    alt={t.asPrivate ? "Privado" : "Público"}
                    className="badge-icon"
                  />
                </div>
              </div>

              {/* ===== Jogo (com logo) ===== */}
              <div className="game-info">
                <div className="game-row">
                  {gameLogo ? (
                    <img
                      src={gameLogo}
                      className="game-logo"
                      alt={`Logo ${t.game?.name ?? "jogo"}`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}

                  <span className="game-name">
                    {t.game?.name?.toUpperCase() || "Jogo não especificado"}
                  </span>
                </div>

                {t.game?.description && (
                  <p className="game-description">{t.game.description}</p>
                )}
              </div>

              {/* ===== Descrição ===== */}
              <p className="card-description">{t.description}</p>

              {/* ===== Metadados ===== */}
              <div className="card-meta">
                <span>Início: {new Date(t.startTime).toLocaleString()}</span>
                <span>Começa em: {renderCountdown(t.startTime)}</span>
                <span>
                  Participantes: {t.currentParticipants}/{t.maxParticipants}
                </span>
              </div>

              {/* ===== Barra de progresso ===== */}
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(t.currentParticipants / t.maxParticipants) * 100}%`,
                  }}
                />
              </div>

              {/* ===== Ações ===== */}
              <div className="card-actions">
                <button
                  className="card-button"
                  disabled={full || t.status !== "OPEN"}
                  onClick={() => handleSubscribe(t.id)}
                >
                  {full ? "Lotado" : "Entrar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && tournaments.length === 0 && (
        <p className="empty-message">Não há torneios abertos no momento.</p>
      )}

      {/* Paginação agora no padrão: controla só o page */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ===== Modal ===== */}
      <AppModal
        open={modal.open}
        onClose={closeModal}
        title={modal.title}
        variant={modal.variant}
        primaryAction={{
          id: "close-modal",
          label: "Ok",
          onClick: closeModal,
        }}
        initialFocus="close-modal"
      >
        <p>{modal.message}</p>
      </AppModal>
    </div>
  );
}