import SearchBar from "../components/Challenges/SearchBar";
import StudentCard from "../components/Challenges/StudentCard";
import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import "../components/Challenges/Challenge.css";
import AuthContext from "../context/AuthContext";

const Challenge = () => {
  // Estado para armazenar os dados paginados dos alunos
  const [students, setStudents] = useState({ content: [], totalPages: 0 });

  const [searchTerm, setSearchTerm] = useState(""); // novo estado para o termo de busca

  // Pegando o token do contexto de autenticação
  const { token } = useContext(AuthContext);

  // Função de busca, memorizada com useCallback
  const fetchStudents = useCallback(
    async (term = "") => {
      try {
        const url = "http://localhost:8080/jokenpo/findByName";
        const response = await axios.get(url, {
          params: { name: term, size: 20 },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setStudents(response.data);
      } catch (error) {
        console.error("Erro ao buscar estudantes:", error);
      }
    },
    [token]
  );

  // useEffect para chamar fetchStudents com debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(searchTerm);
    }, 500); // 500ms de espera

    // Limpa o timeout se searchTerm mudar antes de 500ms
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchStudents]);

  // useEffect para carregar a lista inicial ao abrir a página
  useEffect(() => {
    fetchStudents("");
  }, [fetchStudents]);

  // Função para lidar com a busca, agora só atualiza o estado searchTerm
  const handleSearch = (term) => {
    console.log("Buscar por:", term);
    setSearchTerm(term);
  };

  return (
    <div className="container-challenge">
      <h1>Desafios e Partidas</h1>
      <SearchBar onSearch={handleSearch} />
      <h2 className="section-title">Desafie Seus Amigos</h2>
      <div className="students-grid">
        {students.content.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
};

export default Challenge;
