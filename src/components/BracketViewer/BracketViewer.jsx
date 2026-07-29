import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import "./BracketViewer.css";
import PropTypes from "prop-types";
import confetti from "canvas-confetti";

// Estados de cada partida:
// pending   → só mostra "X vs Y", sem spoiler
// watching  → professor abriu a partida, aguardando reveal
// revealing → card em flip 3D
// revealed  → vencedor mostrado
//
// Partidas de W.O. (match.walkover === true) NÃO entram nesse fluxo de suspense:
// nascem já "revealed" e usam um card próprio (sem flip, com selo de sorteio).

export default function BracketViewer({ tournamentId }) {
  const { token } = useContext(AuthContext);
  const [bracket, setBracket] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [error, setError] = useState(null);
  const [matchStates, setMatchStates] = useState({});
  const [champion, setChampion] = useState(null);

  useEffect(() => {
    async function fetchBracket() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/tournament/${tournamentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        setBracket(response.data);

        const initial = {};
        for (const round of response.data.rounds) {
          for (const match of round.matches) {
            // W.O. já nasce revelado (não há suspense pra um sorteio)
            initial[match.matchId] = match.walkover ? "revealed" : "pending";
          }
        }
        setMatchStates(initial);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
        setError(msg);
      }
    }
    fetchBracket();
  }, [tournamentId, token]);

  if (error) return <div className="bv-error">{error}</div>;
  if (!bracket) return <div className="bv-loading">Carregando bracket...</div>;

  if (champion) {
    return (
      <ChampionScreen name={champion.name} onClose={() => setChampion(null)} />
    );
  }

  const { rounds } = bracket;
  const round = rounds[currentRound];
  const isFinal = currentRound === rounds.length - 1;

  const allRevealed = round.matches.every(
    (m) => matchStates[m.matchId] === "revealed",
  );
  const allRoundResultsAvailable = round.matches.every((m) => m.winnerId);

  function handleWatch(match) {
    setMatchStates((prev) => ({ ...prev, [match.matchId]: "watching" }));
    window.open(`/matches/${match.matchId}`, "_blank");
  }

  function handleReveal(match) {
    setMatchStates((prev) => ({ ...prev, [match.matchId]: "revealing" }));

    const delay = isFinal ? 1800 : 1200;

    setTimeout(() => {
      setMatchStates((prev) => ({ ...prev, [match.matchId]: "revealed" }));

      if (isFinal) {
        fireChampionConfetti();
        const winnerName =
          match.winnerId === match.player1Id
            ? match.player1Name
            : match.player2Name;

        setTimeout(() => {
          setChampion({ name: winnerName });
        }, 1800);
      }
    }, delay);
  }

  // Final decidida por W.O.: sem flip/suspense, o professor aciona o campeão direto
  function revealCurrentRound() {
    setMatchStates((prev) => {
      const next = { ...prev };

      for (const match of round.matches) {
        next[match.matchId] = "revealed";
      }

      return next;
    });
  }

  function handleNextRound() {
    if (!allRevealed) {
      revealCurrentRound();
    }

    setCurrentRound((i) => i + 1);
  }

  function handleShowChampion(match) {
    fireChampionConfetti();
    const winnerName =
      match.winnerId === match.player1Id
        ? match.player1Name
        : match.player2Name;
    setChampion({ name: winnerName });
  }

  return (
    <div className={`bv-container ${isFinal ? "bv-is-final" : ""}`}>
      <h2 className={`bv-title ${isFinal ? "bv-title--final" : ""}`}>
        {isFinal ? "🏆 " : ""}
        {round.name}
        {isFinal ? " 🏆" : ""}
      </h2>

      <div className="bv-phase-indicator">
        {rounds.map((r, i) => (
          <div
            key={i}
            className={[
              "bv-phase-dot",
              i === currentRound ? "bv-phase-dot--active" : "",
              i < currentRound ? "bv-phase-dot--done" : "",
            ].join(" ")}
            title={r.name}
          />
        ))}
      </div>

      <div className="bv-rounds-wrapper">
        <div className={`bv-round ${isFinal ? "bv-round--final" : ""}`}>
          {round.matches.map((match) => {
            const state = matchStates[match.matchId] || "pending";
            const winnerIsP1 = match.winnerId === match.player1Id;
            return (
              <MatchCard
                key={match.matchId}
                match={match}
                state={state}
                winnerIsP1={winnerIsP1}
                isFinal={isFinal}
                onWatch={() => handleWatch(match)}
                onReveal={() => handleReveal(match)}
                onShowChampion={() => handleShowChampion(match)}
              />
            );
          })}
        </div>
      </div>

      <div className="bv-nav">
        <button
          className="bv-nav-button"
          onClick={() => setCurrentRound((i) => i - 1)}
          disabled={currentRound === 0}
        >
          ← Fase anterior
        </button>

        {allRoundResultsAvailable && !isFinal && (
          <button
            className="bv-nav-button bv-nav-button--next"
            onClick={handleNextRound}
          >
            Próxima fase →
          </button>
        )}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  state,
  winnerIsP1,
  isFinal,
  onWatch,
  onReveal,
  onShowChampion,
}) {
  // Caminho do W.O.: card próprio, já revelado, sem flip nem suspense.
  if (match.walkover) {
    return (
      <WalkoverMatchCard
        match={match}
        winnerIsP1={winnerIsP1}
        isFinal={isFinal}
        onShowChampion={onShowChampion}
      />
    );
  }

  const isFlipping = state === "revealing";
  const isRevealed = state === "revealed";

  return (
    <div
      className={`bv-flip-wrapper ${isFinal ? "bv-flip-wrapper--final" : ""}`}
    >
      <div
        className={`bv-flip-inner ${isFlipping ? "bv-flip-inner--flipping" : ""} ${isRevealed ? "bv-flip-inner--flipped" : ""}`}
      >
        {/* Frente — sem spoiler */}
        <div
          className={`bv-match-card bv-match-card--front bv-match-card--${state} ${isFinal ? "bv-match-card--final" : ""}`}
        >
          <div className="bv-match-players">
            <span
              className={`bv-player-name ${isFinal ? "bv-player-name--final" : ""}`}
            >
              {match.player1Name}
            </span>
            <span className="bv-vs">vs</span>
            <span
              className={`bv-player-name ${isFinal ? "bv-player-name--final" : ""}`}
            >
              {match.player2Name}
            </span>
          </div>
          
          {state === "pending" && (
            <div className="bv-match-actions">
              <button className="bv-replay-button" onClick={onWatch}>
                Assistir partida
              </button>

              <button
                type="button"
                className="bv-replay-button bv-replay-button--result"
                onClick={onReveal}
              >
                Ver resultado
              </button>
            </div>
          )}

          <div className="bv-match-actions">
            {state === "watching" && (
              <button className="bv-reveal-button" onClick={onReveal}>
                🔥 Revelar vencedor
              </button>
            )}
            {state === "revealing" && (
              <div className="bv-revealing-text">
                <span className="bv-dot-flash">●</span>
                <span className="bv-dot-flash bv-dot-flash--2">●</span>
                <span className="bv-dot-flash bv-dot-flash--3">●</span>
              </div>
            )}
          </div>
        </div>

        {/* Verso — com vencedor */}
        <div
          className={`bv-match-card bv-match-card--back ${isFinal ? "bv-match-card--final" : ""}`}
        >
          <div className="bv-match-players">
            <PlayerSlot
              name={match.player1Name}
              isWinner={winnerIsP1}
              isFinal={isFinal}
            />
            <span className="bv-vs">vs</span>
            <PlayerSlot
              name={match.player2Name}
              isWinner={!winnerIsP1}
              isFinal={isFinal}
            />
          </div>

          <MatchResultSummary match={match}/>

          <div className="bv-match-actions">
            <button
              className="bv-replay-button bv-replay-button--secondary"
              onClick={() => window.open(`/matches/${match.matchId}`, "_blank")}
            >
              ↩ Rever partida
            </button>

            {isFinal && (
              <button className="bv-replay-button" onClick={onShowChampion}>
                🏆 Ver campeão
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchResultSummary({ match }) {
   const summary = getMatchSummary(match)

   return (
      <div className="bv-match-summary">
         <strong>{summary.winnerName} venceu</strong>

         {summary.score && (
            <span>Placar: {summary.score}</span>
         )}

         {summary.ties !== undefined && (
            <span>Empates: {summary.ties}</span>
         )}
      </div>
   )
}

function getMatchSummary(match) {
   const winnerName =
      match.winnerName ||
      (match.winnerId === match.player1Id
         ? match.player1Name
         : match.player2Name)

   const p1Score = match.player1Score ?? match.scorePlayer1
   const p2Score = match.player2Score ?? match.scorePlayer2
   const ties = match.ties ?? match.tieCount

   return {
      winnerName,
      score:
         p1Score !== undefined && p2Score !== undefined
            ? `${p1Score} x ${p2Score}`
            : null,
      ties
   }
}

function WalkoverMatchCard({ match, winnerIsP1, isFinal, onShowChampion }) {
  return (
    <div
      className={`bv-flip-wrapper ${isFinal ? "bv-flip-wrapper--final" : ""}`}
    >
      <div
        className={`bv-match-card bv-match-card--walkover ${isFinal ? "bv-match-card--final" : ""}`}
      >
        <span className="bv-walkover-tag">⚖️ Sorteio</span>

        <div className="bv-match-players">
          <PlayerSlot
            name={match.player1Name}
            isWinner={winnerIsP1}
            isFinal={isFinal}
          />
          <span className="bv-vs">vs</span>
          <PlayerSlot
            name={match.player2Name}
            isWinner={!winnerIsP1}
            isFinal={isFinal}
          />
        </div>

        <p className="bv-walkover-note">
          {match.reason ||
            "Partida não disputada — classificação decidida por sorteio."}
        </p>

        <div className="bv-match-actions">
          <button
            className="bv-replay-button bv-replay-button--secondary"
            onClick={() => window.open(`/matches/${match.matchId}`, "_blank")}
          >
            Ver detalhes
          </button>
          {isFinal && (
            <button className="bv-replay-button" onClick={onShowChampion}>
              🏆 Ver campeão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerSlot({ name, isWinner, isFinal }) {
  return (
    <span
      className={[
        "bv-player-name",
        isFinal ? "bv-player-name--final" : "",
        isWinner ? "bv-player-name--winner" : "bv-player-name--loser",
      ].join(" ")}
    >
      {isWinner && <span className="bv-crown">👑 </span>}
      {name}
    </span>
  );
}

function ChampionScreen({ name, onClose }) {
  useEffect(() => {
    const end = Date.now() + 4000;
    const colors = ["#ffb84d", "#9c27b0", "#4dac4a", "#fff", "#ff9933"];

    function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        startVelocity: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        startVelocity: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }

    frame();
  }, []);

  return (
    <div className="bv-champion-screen" onClick={onClose}>
      <div className="bv-champion-content">
        <div className="bv-champion-trophy">🏆</div>
        <p className="bv-champion-label">Campeão</p>
        <h1 className="bv-champion-name">{name}</h1>
        <p className="bv-champion-hint">clique para fechar</p>
      </div>
    </div>
  );
}

function fireChampionConfetti() {
  const duration = 1000;
  const end = Date.now() + duration;
  const colors = ["#ffb84d", "#9c27b0", "#ffffff"];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

BracketViewer.propTypes = {
  tournamentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    matchId: PropTypes.number.isRequired,
    player1Name: PropTypes.string.isRequired,
    player2Name: PropTypes.string.isRequired,
    player1Id: PropTypes.number.isRequired,
    winnerId: PropTypes.number.isRequired,
    walkover: PropTypes.bool,
    reason: PropTypes.string,
  }).isRequired,
  state: PropTypes.string.isRequired,
  winnerIsP1: PropTypes.bool.isRequired,
  isFinal: PropTypes.bool.isRequired,
  onWatch: PropTypes.func.isRequired,
  onReveal: PropTypes.func.isRequired,
  onShowChampion: PropTypes.func.isRequired,
};

MatchResultSummary.propTypes = {
   match: PropTypes.shape({
      winnerName: PropTypes.string,
      winnerId: PropTypes.number,
      player1Id: PropTypes.number,
      player2Id: PropTypes.number,
      player1Name: PropTypes.string,
      player2Name: PropTypes.string,
      player1Score: PropTypes.number,
      scorePlayer1: PropTypes.number,
      player2Score: PropTypes.number,
      scorePlayer2: PropTypes.number,
      ties: PropTypes.number,
      tieCount: PropTypes.number
   }).isRequired
}

WalkoverMatchCard.propTypes = {
  match: PropTypes.shape({
    matchId: PropTypes.number.isRequired,
    player1Name: PropTypes.string.isRequired,
    player2Name: PropTypes.string.isRequired,
    player1Id: PropTypes.number.isRequired,
    winnerId: PropTypes.number.isRequired,
    reason: PropTypes.string,
  }).isRequired,
  winnerIsP1: PropTypes.bool.isRequired,
  isFinal: PropTypes.bool.isRequired,
  onShowChampion: PropTypes.func.isRequired,
};

PlayerSlot.propTypes = {
  name: PropTypes.string.isRequired,
  isWinner: PropTypes.bool.isRequired,
  isFinal: PropTypes.bool.isRequired,
};

ChampionScreen.propTypes = {
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

