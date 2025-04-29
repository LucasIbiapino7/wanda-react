import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import "./SearchBar.css";
import SearchImg from "../../assets/search.svg" 

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // evita múltiplas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Pesquisar alunos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <img src={SearchImg} alt="Buscar" className="search-icon" />
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
