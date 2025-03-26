import PropTypes from "prop-types";
import "./Pagination.css"; 

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={handlePrevious}
        disabled={currentPage === 0}
      >
        &laquo; Anterior
      </button>

      <span className="pagination-info">{`Página ${
        currentPage + 1
      } de ${totalPages}`}</span>

      <button
        className="pagination-button"
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
      >
        Próxima &raquo;
      </button>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
