import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './CardsBattle.css';

const CardsBattle = ({ selectedCard, winnerCard }) => {
  // Array fixo com os tipos de cartas
  const cards = ['pedra', 'papel', 'tesoura'];

  return (
    <div className="cards-battle">
      {cards.map((card) => (
        <motion.div
          key={card}
          className={`card-battle ${selectedCard === card ? 'selected' : ''} ${winnerCard === card ? 'winner' : ''}`}
          initial={{ scale: 1 }}
          animate={{ 
            scale: selectedCard === card ? 1.2 : 1,
            // Se quiser, pode ajustar a posição vertical, mas como as cartas estão empilhadas,
            // o destaque com scale já é suficiente para dar a sensação de “avançar”
            y: selectedCard === card ? -10 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <img src={`/assets/${card}.webp`} alt={card} />
        </motion.div>
      ))}
    </div>
  );
};

CardsBattle.propTypes = {
  selectedCard: PropTypes.string,
  winnerCard: PropTypes.string,
};

export default CardsBattle;
