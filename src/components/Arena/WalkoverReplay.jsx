import PropTypes from "prop-types";
import ArenaBackground from "../../assets/arena-background-pixel-art.png";
import "./Arena.css";
import "./WalkoverReplay.css";

/**
 * Tela de replay para confrontos decididos por W.O. (sorteio).
 *
 * Reaproveita o palco da arena do Jokenpo (mesmo fundo, mesmos personagens e
 * posições) de forma ESTÁTICA — sem rounds, cartas ou animação — porque uma
 * partida de W.O. não foi disputada. Por cima do palco, exibe a explicação
 * do sorteio e destaca o vencedor.
 *
 * Espera o mesmo payload de replay dos outros players (duel/duelData), que no
 * caso de W.O. vem com `type === "WALKOVER"`, `reason`, os dois jogadores e o
 * vencedor (em `duelWInner` no bits ou `playerWinner` no jokenpo).
 */
function WalkoverReplay({ duel }) {
  const data = duel || {};

  const player1 = data.player1 || {};
  const player2 = data.player2 || {};
  // o vencedor pode vir como duelWInner (bits) ou playerWinner (jokenpo)
  const winner = data.duelWInner || data.playerWinner || null;

  const p1Name = player1.nickname || player1.name || "Jogador 1";
  const p2Name = player2.nickname || player2.name || "Jogador 2";

  const reason =
    data.reason ||
    "Esta partida não pôde ser disputada e o vencedor foi decidido por sorteio.";

  const isWinner = (player) =>
    winner && player && winner.id != null && winner.id === player.id;

  return (
    <div className="arena-container">
      <div
        className="arena walkover-arena"
        style={{ backgroundImage: `url(${ArenaBackground})` }}
      >
        {/* faixa de anúncio reaproveitando o espaço do "match-announcement" */}
        <div className="walkover-banner">
          <span className="walkover-tag">SORTEIO</span>
          <p className="walkover-reason">{reason}</p>
          {winner && (
            <p className="walkover-winner">
              Classificado(a) por sorteio: <strong>{winner.name}</strong>
            </p>
          )}
        </div>

        <div className="player-info left">
          <h2 className="player-name">{p1Name}</h2>
          {isWinner(player1) && <span className="walkover-badge">Avançou</span>}
        </div>

        <div className="player-info right">
          <h2 className="player-name">{p2Name}</h2>
          {isWinner(player2) && <span className="walkover-badge">Avançou</span>}
        </div>

        {player1.character_url && (
          <img
            src={`/assets/personagens/${player1.character_url}`}
            alt="Jogador 1"
            className={`character left ${isWinner(player1) ? "" : "walkover-dimmed"}`}
          />
        )}
        {player2.character_url && (
          <img
            src={`/assets/personagens/${player2.character_url}`}
            alt="Jogador 2"
            className={`character right ${isWinner(player2) ? "" : "walkover-dimmed"}`}
          />
        )}
      </div>
    </div>
  );
}

WalkoverReplay.propTypes = {
  duel: PropTypes.shape({
    type: PropTypes.string,
    reason: PropTypes.string,
    player1: PropTypes.object,
    player2: PropTypes.object,
    duelWInner: PropTypes.object,
    playerWinner: PropTypes.object,
  }),
};

WalkoverReplay.defaultProps = {
  duel: null,
};

export default WalkoverReplay;

