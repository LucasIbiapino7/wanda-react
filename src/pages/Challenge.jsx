import SearchBar from "../components/Challenges/SearchBar";
import StudentCard from "../components/Challenges/StudentCard";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import "../components/Challenges/Challenge.css";
import AuthContext from "../context/AuthContext";
import PendingChallenges from "../components/Challenges/PendingChallenges";
import Pagination from "../components/Challenges/Pagination";
import BadgePreviewModal from "../components/Challenges/BadgePreviewModal";
import ProfileService from "../services/ProfileService";
import ChallengeService from "../services/ChallengeService";
import AppModal from "../components/UI/AppModal";

const GAMES = [
  { key: "jokenpo", label: "Jokenpo", icon: "/assets/games/jokenpo-logo.png" },
  { key: "bits", label: "BITS", icon: "/assets/games/bits-logo.png" },
];

function extractApiError(err) {
  const status = err?.response?.status ?? err?.normalized?.status ?? 0;
  const data = err?.response?.data;
  const backendMsg = data?.error || data?.message;
  const normalizedMsg = err?.normalized?.message;
  const msg =
    backendMsg ||
    normalizedMsg ||
    (status === 0
      ? "Falha de conexão. Tente novamente."
      : "Erro ao enviar o desafio.");
  return { status, message: msg };
}

const Challenge = () => {
  const [students, setStudents] = useState({ content: [], totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const [selectedBadge, setSelectedBadge] = useState(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [sendingGameKey, setSendingGameKey] = useState("");

  const { token } = useContext(AuthContext);

  const requestSeq = useRef(0);

  const fetchStudents = useCallback(async (term = "", page = 0) => {
    setLoading(true);
    const seq = ++requestSeq.current;
    try {
      const data = await ProfileService.findByName({
        name: term,
        page,
        size: 4,
      });

      if (seq === requestSeq.current) {
        setStudents(data);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch (error) {
      console.error("Erro ao buscar estudantes:", error);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchStudents(searchTerm, currentPage);
  }, [token, searchTerm, currentPage, fetchStudents]);

  const handleSearch = useCallback(
    (term) => {
      const next = String(term ?? "").trim();
      const prev = String(searchTerm ?? "").trim();

      // evita resetar paginação se o SearchBar chamar onSearch com o mesmo termo
      if (next === prev) return;

      setCurrentPage(0);
      setSearchTerm(next);
    },
    [searchTerm]
  );

  const openGamePicker = (student) => {
    setTargetStudent(student);
    setSheetOpen(true);
  };

  const closeGamePicker = () => {
    setSheetOpen(false);
    setTargetStudent(null);
    setSendingGameKey("");
  };

  const submitChallenge = async (game) => {
    if (!targetStudent) return;
    setSendingGameKey(game.key);

    try {
      await ChallengeService.create({
        challengedId: targetStudent.id,
        gameName: game.key,
      });

      setModal({
        open: true,
        title: "Desafio enviado",
        message: `Seu desafio para ${targetStudent.name} em ${game.label} foi enviado!`,
        variant: "success",
      });

      closeGamePicker();
    } catch (err) {
      const { status, message } = extractApiError(err);

      let title = "Não conseguimos enviar seu desafio!";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";

      setModal({
        open: true,
        title,
        message,
        variant: "error",
      });

      console.error("submitChallenge error:", { status, message, err });
    } finally {
      setSendingGameKey("");
    }
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  return (
    <div className="container-challenge">
      <h1>Desafios e Partidas</h1>

      <SearchBar value={searchTerm} onSearch={handleSearch} />

      <h2 className="section-title">Desafie Seus Amigos</h2>

      <div className="students-grid">
        {loading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <p>Carregando jogadores...</p>
          </div>
        ) : students.content.length > 0 ? (
          students.content.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onOpenChallenge={() => openGamePicker(student)}
              onBadgeClick={(badge) => setSelectedBadge(badge)}
            />
          ))
        ) : (
          <div className="no-results" role="status" aria-live="polite">
            <p>Nenhum aluno encontrado.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(0);
              }}
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <PendingChallenges />

      <BadgePreviewModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />

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

      {sheetOpen && (
        <>
          <div className="sheet-backdrop" onClick={closeGamePicker} />
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="sheet-header">
              <h3>Desafiar {targetStudent?.name}</h3>
              <button
                className="sheet-close"
                onClick={closeGamePicker}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="sheet-body">
              <p className="sheet-subtitle">Escolha o jogo:</p>

              <div className="game-grid">
                {GAMES.map((g) => (
                  <button
                    key={g.key}
                    className="game-card"
                    onClick={() => submitChallenge(g)}
                    disabled={!!sendingGameKey && sendingGameKey !== g.key}
                    aria-busy={sendingGameKey === g.key}
                  >
                    <img src={g.icon} alt={`Logo ${g.label}`} />
                    <span>{g.label}</span>
                    {sendingGameKey === g.key && (
                      <span className="game-sending">Enviando...</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Challenge;
