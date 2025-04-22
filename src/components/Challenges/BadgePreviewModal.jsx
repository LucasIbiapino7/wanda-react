import PropTypes from "prop-types";
import "./BadgePreviewModal.css";

export default function BadgePreviewModal({ badge, onClose }) {
  if (!badge) return null;
  return (
    <div className="bpm-overlay" onClick={onClose}>
      <div className="bpm-content" onClick={(e) => e.stopPropagation()}>
        <button className="bpm-close" onClick={onClose}>
          &times;
        </button>
        <img
          src={`/assets/badges/${badge.iconUrl}`}
          alt={badge}
          className="bpm-image"
        />
      </div>
    </div>
  );
}

BadgePreviewModal.propTypes = {
  badge: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
