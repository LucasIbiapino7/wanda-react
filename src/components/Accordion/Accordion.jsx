import { useState } from "react";
import PropTypes from "prop-types"; 
import "./Accordion.css"

function Accordion({ title, content, image }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion">
      <div
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3>{title}</h3>
        <span>{isOpen ? "-" : "+"}</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          <p>{content}</p>
          {image && (
            <img
              src={image}
              alt={title}
              className="accordion-image"
            />
          )}
        </div>
      )}
    </div>
  );
}

Accordion.propTypes = {
    content: PropTypes.string,
    title: PropTypes.string,
    image: PropTypes.string
  };

export default Accordion;
