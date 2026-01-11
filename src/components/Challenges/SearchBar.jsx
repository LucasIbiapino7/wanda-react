import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";
import SearchImg from "../../assets/search.svg";

const SearchBar = ({ value = "", onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const inputRef = useRef(null);

  // guarda sempre a versão mais recente do onSearch sem re-disparar debounce
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // mantém o input sincronizado com o pai
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // debounce (agora depende só do searchTerm)
  useEffect(() => {
    const id = setTimeout(() => onSearchRef.current(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm("");
    onSearchRef.current(""); // dispara busca vazia imediatamente
    inputRef.current?.focus();
  };

  return (
    <div className="search-container" role="search">
      <img src={SearchImg} alt="" className="search-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Pesquisar alunos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Pesquisar alunos"
      />
      {searchTerm && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Limpar busca"
          title="Limpar"
        >
          &times;
        </button>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
