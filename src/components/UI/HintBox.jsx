import PropTypes from "prop-types";
import "./HintBox.css";

export default function HintBox({ text, color = "#0b66d1", icon, className = "" }) {
  return (
    <div
      className={`hintbox-container ${className}`}
      style={{ borderColor: color }}
      aria-live="polite"
    >
      <div className="hintbox-icon" style={{ color }}>
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 9v4m0 4h.01" />
          </svg>
        )}
      </div>
      <p className="hintbox-text">{text}</p>
    </div>
  );
}

HintBox.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
};
