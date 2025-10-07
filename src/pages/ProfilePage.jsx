import { useState, useEffect, useContext, useMemo } from "react";
import AuthContext from "../context/AuthContext";
import "../components/ProfilePage/ProfilePage.css";
import ProfileService from "../services/ProfileService";
import MatchService from "../services/MatchService";
import Pagination from "../components/Challenges/Pagination";

export default function ProfilePage() {
  const { token } = useContext(AuthContext);

  // data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ui / nickname
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [nickSaving, setNickSaving] = useState(false);
  const [nickError, setNickError] = useState("");

  // functions
  const [activeFuncIdx, setActiveFuncIdx] = useState(0);

  // matches
  const [matches, setMatches] = useState([]);
  const [matchPage, setMatchPage] = useState(0);
  const [matchTotalPages, setMatchTotalPages] = useState(0);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState(null);

  // character drawer
  const characters = ["p1.png", "p2.png", "p3.png", "p4.png", "p5.png", "p6.png"];
  const [selectedChar, setSelectedChar] = useState(null);
  const [initialChar, setInitialChar] = useState(null);
  const [showCharDrawer, setShowCharDrawer] = useState(false);
  const [updatingChar, setUpdatingChar] = useState(false);

  // toast global
  const [toastMsg, setToastMsg] = useState("");

  const gameIconSrc = (gameName) =>
    `/assets/games/${String(gameName || "").toLowerCase()}.png`;

  // profile
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await ProfileService.getMe();
        setProfile(data);
        setInitialChar(data.characterUrl);
        setSelectedChar(data.characterUrl);
      } catch (err) {
        console.error("fetchProfile error:", err);
        setError(err?.normalized?.message || "Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  // functions list
  const functions = useMemo(() => profile?.functions ?? [], [profile]);
  useEffect(() => {
    if (functions.length > 0) setActiveFuncIdx(0);
  }, [functions.length]);

  // matches
  const fetchMatches = async (page = 0) => {
    setMatchLoading(true);
    setMatchError(null);
    try {
      const data = await MatchService.list({ page, size: 5 });
      setMatches(data.content || []);
      setMatchPage(data.number ?? page);
      setMatchTotalPages(data.totalPages ?? 0);
    } catch (err) {
      console.error("fetchMatches error:", err);
      setMatchError("Não foi possível carregar suas partidas.");
    } finally {
      setMatchLoading(false);
    }
  };
  useEffect(() => {
    if (token) fetchMatches(0);
  }, [token]);

  // nickname: validação client-side (espelha o back)
  const validateNickname = (v) => {
    const val = (v || "").trim();
    if (!val) return "O nickname é obrigatório";
    if (val.length < 3 || val.length > 20) return "O nickname deve ter entre 3 e 20 caracteres";
    const re = /^[A-Za-zÀ-ÿ0-9_ ]+$/;
    if (!re.test(val)) return "O nickname deve conter apenas letras, números, espaços ou _";
    return "";
  };

  const startNickEdit = () => {
    setNickDraft(profile?.nickname || "");
    setNickError("");
    setEditingNick(true);
  };
  const cancelNickEdit = () => {
    setEditingNick(false);
    setNickDraft("");
    setNickError("");
  };
  const saveNickEdit = async () => {
    const errMsg = validateNickname(nickDraft);
    if (errMsg) {
      setNickError(errMsg);
      return;
    }
    setNickSaving(true);
    setNickError("");
    try {
      await ProfileService.updateNickname(nickDraft.trim()); // 204
      // espelha no estado local imediatamente
      setProfile((p) => ({ ...p, nickname: nickDraft.trim() }));
      setEditingNick(false);
      setToastMsg("Nickname atualizado!");
      setTimeout(() => setToastMsg(""), 1500);
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 422 && Array.isArray(data?.errors)) {
        const e = data.errors.find((x) => String(x.fieldName).toLowerCase() === "nickname");
        setNickError(e?.message || "Nickname inválido.");
      } else {
        setNickError(err?.normalized?.message || "Não foi possível atualizar o nickname.");
        setToastMsg("Falha ao atualizar nickname.");
        setTimeout(() => setToastMsg(""), 2000);
      }
    } finally {
      setNickSaving(false);
    }
  };

  // character drawer
  const handleCharSelect = (url) => setSelectedChar(url);
  const openCharDrawer = () => setShowCharDrawer(true);
  const closeCharDrawer = () => setShowCharDrawer(false);

  const handleConfirmCharacter = async () => {
    if (selectedChar === initialChar) {
      closeCharDrawer();
      return;
    }
    setUpdatingChar(true);
    try {
      await ProfileService.updateCharacter(selectedChar); // 204
      // atualiza imediatamente na UI
      setInitialChar(selectedChar);
      setProfile((p) => ({ ...p, characterUrl: selectedChar }));
      setToastMsg("Personagem atualizado!");
      setTimeout(() => setToastMsg(""), 1500);
      closeCharDrawer();
    } catch {
      setToastMsg("Erro ao atualizar personagem.");
      setTimeout(() => setToastMsg(""), 2000);
    } finally {
      setUpdatingChar(false);
    }
  };

  // copy function code
  const copyCode = async () => {
    try {
      const code = functions[activeFuncIdx]?.code || "";
      await navigator.clipboard.writeText(code);
      setToastMsg("Código copiado!");
      setTimeout(() => setToastMsg(""), 1200);
    } catch {
      // ignore
    }
  };

  if (loading) return <div className="pp-loading">Carregando perfil...</div>;
  if (error) return <div className="pp-error">{error}</div>;
  if (!profile) return null;

  const {
    name,
    nickname,
    characterUrl,
    numberOfMatches,
    numberOfWinners,
    winsTournaments,
    badges = [],
  } = profile;

  const activeFunc = functions[activeFuncIdx];

  return (
    <div className="pp-container">
      {/* ===== Topbar compacta ===== */}
      <header className="pp-topbar">
        <div className="pp-topbar-left">
          <div
            className="pp-avatar pp-avatar--small"
            style={{ backgroundImage: `url(/assets/personagens/${characterUrl})` }}
            onClick={openCharDrawer}
            role="button"
            title="Trocar personagem"
          />
          <div>
            <h1 className="pp-name">olá, {name}!</h1>

            <div className="pp-nick-row">
              <span className="pp-field-label">Seu Nickname:</span>
              {!editingNick ? (
                <span className="pp-nick-badge">
                  {nickname && nickname.trim() ? (
                    <>@{nickname}</>
                  ) : (
                    <span className="pp-nick-empty">sem nickname</span>
                  )}
                </span>
              ) : (
                <span className="pp-nick-edit">
                  <span>@</span>
                  <input
                    className="pp-nick-input"
                    value={nickDraft}
                    onChange={(e) => {
                      setNickDraft(e.target.value);
                      if (nickError) setNickError("");
                    }}
                    placeholder="seu_nickname"
                    aria-label="Editar nickname"
                    aria-invalid={!!nickError}
                    aria-describedby="nick-error"
                  />
                </span>
              )}

              {!editingNick ? (
                <button className="pp-btn" onClick={startNickEdit}>EDIT</button>
              ) : (
                <>
                  <button
                    className="pp-btn pp-btn--primary"
                    onClick={saveNickEdit}
                    disabled={nickSaving}
                  >
                    {nickSaving ? "SAVING..." : "SAVE"}
                  </button>
                  <button className="pp-btn" onClick={cancelNickEdit} disabled={nickSaving}>
                    CANCEL
                  </button>
                </>
              )}
            </div>
            {nickError && (
              <div id="nick-error" className="field-error" style={{ marginTop: 8, maxWidth: 360 }}>
                {nickError}
              </div>
            )}
          </div>
        </div>

        <div className="pp-topbar-actions">
          <button className="pp-btn pp-btn--primary" onClick={openCharDrawer}>
            TROCAR PERSONAGEM
          </button>
        </div>
      </header>

      {/* ===== Grid principal ===== */}
      <div className="pp-grid">
        {/* Sidebar */}
        <aside className="pp-aside">
          <div className="pp-card">
            <div
              className="pp-avatar"
              style={{ backgroundImage: `url(/assets/personagens/${characterUrl})` }}
            />
            <div className="pp-stats">
              <div className="pp-stat">
                <span className="pp-stat-value">{numberOfMatches}</span>
                <span className="pp-stat-label">Partidas Jogadas</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-value">{numberOfWinners}</span>
                <span className="pp-stat-label">Partidas Vencidas</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-value">{winsTournaments}</span>
                <span className="pp-stat-label">Torneios Vencidos</span>
              </div>
            </div>
          </div>

          <div className="pp-card">
            <h2>Badges</h2>
            {badges.length ? (
              <div className="pp-badges-list">
                {badges.map((b) => (
                  <img
                    key={b.id}
                    src={`/assets/badges/${b.iconUrl}`}
                    alt={b.name}
                    title={b.name}
                    className="pp-badge"
                  />
                ))}
              </div>
            ) : (
              <p className="pp-no-badges">Você ainda não possui badges.</p>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="pp-main">
          {/* Funções */}
          <section className="pp-functions">
            <div className="pp-functions-head">
              <h2>Funções</h2>
              <div className="pp-func-toolbar">
                <button className="pp-btn" onClick={copyCode}>COPIAR CÓDIGO</button>
              </div>
            </div>

            <div className="pp-func-tabs" role="tablist" aria-label="Funções do usuário">
              {functions.map((f, idx) => {
                const label =
                  f?.functionName ||
                  f?.game?.name ||
                  `Função ${String(idx + 1).padStart(2, "0")}`;

                const icon = f?.game?.name
                  ? `/assets/games/${String(f.game.name).toLowerCase()}.png`
                  : `/assets/games/default.png`;

                const active = activeFuncIdx === idx;
                return (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={active}
                    aria-pressed={active}
                    className={"pp-func-chip" + (active ? " pp-func-chip--active" : "")}
                    onClick={() => setActiveFuncIdx(idx)}
                    title={label}
                  >
                    <img src={icon} alt="" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pp-func-content" role="tabpanel">
              {activeFunc?.game?.name && (
                <img
                  className="pp-game-icon"
                  src={gameIconSrc(activeFunc.game.name)}
                  alt={activeFunc.game.name}
                />
              )}
              <pre>
                <code className="language-python">
                  {activeFunc?.code || "# nenhuma função cadastrada"}
                </code>
              </pre>
            </div>
          </section>

          {/* Histórico */}
          <section className="pp-history">
            <h2 className="pp-history-title">Últimas Partidas</h2>

            {matchLoading && <p className="pp-loading">Carregando partidas...</p>}
            {matchError && <p className="pp-error">{matchError}</p>}
            {!matchLoading && !matches.length && (
              <p className="pp-empty">Você ainda não participou de nenhuma partida.</p>
            )}

            <div className="pp-matches-grid">
              {matches.map((m) => (
                <div key={m.id} className="pp-match-card">
                  <div className="pp-match-players">
                    <div className="pp-match-player">
                      <img
                        src={`/assets/personagens/${m.player1.character_url}`}
                        alt={m.player1.name}
                        className="pp-match-avatar"
                      />
                      <span className={m.winner.id === m.player1.id ? "pp-winner" : ""}>
                        {m.player1.name}
                      </span>
                    </div>
                    <span className="pp-match-vs">vs</span>
                    <div className="pp-match-player">
                      <img
                        src={`/assets/personagens/${m.player2.character_url}`}
                        alt={m.player2.name}
                        className="pp-match-avatar"
                      />
                      <span className={m.winner.id === m.player2.id ? "pp-winner" : ""}>
                        {m.player2.name}
                      </span>
                    </div>
                  </div>
                  <button
                    className="pp-match-button"
                    onClick={() => window.open(`/matches/${m.id}`, "_blank")}
                  >
                    Assistir
                  </button>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={matchPage}
              totalPages={matchTotalPages}
              onPageChange={(p) => fetchMatches(p)}
            />
          </section>
        </main>
      </div>

      {/* ===== Character Drawer ===== */}
      <div className={"pp-drawer" + (showCharDrawer ? " pp-drawer--open" : "")} aria-hidden={!showCharDrawer}>
        <div className="pp-drawer-header">
          <h2>Escolha seu personagem</h2>
          <button className="pp-btn" onClick={closeCharDrawer}>FECHAR</button>
        </div>
        <div className="pp-char-grid">
          {characters.map((c) => (
            <div
              key={c}
              className={"pp-char-option" + (c === selectedChar ? " pp-char-option--active" : "")}
              onClick={() => handleCharSelect(c)}
            >
              <img src={`/assets/personagens/${c}`} alt={c} />
            </div>
          ))}
        </div>
        <button
          className="pp-char-confirm-btn"
          onClick={handleConfirmCharacter}
          disabled={updatingChar || selectedChar === initialChar}
        >
          {updatingChar ? "Enviando..." : "Confirmar Personagem"}
        </button>
      </div>
      {/* backdrop */}
      {showCharDrawer && <div className="pp-backdrop" onClick={closeCharDrawer} />}

      {/* ===== Global Toast ===== */}
      {toastMsg && (
        <div className="pp-toast" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
