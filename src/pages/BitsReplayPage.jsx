import PropTypes from "prop-types";
import BitsArenaReplay from "../components/Arena/BitsArenaReplay";

function BitsReplayPage({ duel }) {
  if (!duel) {
    return (
      <div className="loading-replay-container">
        <p>Nenhum replay do BITS encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <BitsArenaReplay duel={duel} />
    </div>
  );
}

BitsReplayPage.propTypes = {
  duel: PropTypes.shape({
    game: PropTypes.any,
    player1: PropTypes.object,
    player2: PropTypes.object,
    duelWInner: PropTypes.any,
    matches: PropTypes.array,
  }),
};

BitsReplayPage.defaultProps = {
  duel: null,
};

export default BitsReplayPage;
