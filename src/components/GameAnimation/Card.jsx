import PropTypes from 'prop-types';
import "./Styles.css"

const Card = ({ type, isWinner }) => {
    console.log("Type:" + type)
  return (
    <div className={`card ${isWinner ? 'winner' : ''}`}>
      <img 
        src={`/icons/${type}.png`}
        alt={type} 
        className="card-image"
      />
      <span className="card-label">{type}</span>
    </div>
  );
};

Card.propTypes = {
  type: PropTypes.string.isRequired,
  isWinner: PropTypes.bool
};

export default Card;