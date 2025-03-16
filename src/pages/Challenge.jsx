import SearchBar from "../components/Challenges/SearchBar";
import StudentCard from "../components/Challenges/StudentCard";
import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import "../components/Challenges/Challenge.css";
import AuthContext from "../context/AuthContext";
import PendingChallenges from "../components/Challenges/PendingChallenges";
import FunctionModal from "../components/Challenges/FunctionModal";

const Challenge = () => {
  // Estado para armazenar os dados paginados dos alunos
  const [students, setStudents] = useState({ content: [], totalPages: 0 });

  const [searchTerm, setSearchTerm] = useState(""); // novo estado para o termo de busca

  const [challengeMessage, setChallengeMessage] = useState(""); // NOVO ESTADO para feedback de desafio

  // Estado para controlar a abertura do modal e o código a ser exibido
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState("");

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

  // Envia um desafio para um estudante (ao clicar no botão "Desafiar" no StudentCard)
  const handleChallenge = async (challengedId) => {
    try {
      const url = "http://localhost:8080/jokenpo/challenge";
      const requestBody = { challengedId };
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Se o backend retornar 204 (No Content), o desafio foi enviado com sucesso
      if (response.status === 204) {
        setChallengeMessage("Desafio enviado com sucesso!");
      }
    } catch (error) {
      // Se o adversário não existir (404)
      if (error.response?.status === 404) {
        setChallengeMessage("Adversário não encontrado!");
      }
      // Se já existir um desafio pendente (400 com mensagem específica)
      else if (
        error.response?.status === 400 &&
        error.response.data?.error === "Já existe um desafio pendente!"
      ) {
        setChallengeMessage("Já existe um desafio pendente!");
      } else {
        setChallengeMessage("Erro ao enviar o desafio.");
      }
    }
  };

  // Função para fechar o modal (após exibir o feedback)
  const closeModal = () => {
    setChallengeMessage("");
  };

  const handleOpenModal = (code) => {
    setModalCode(code);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalCode("");
  };

  return (
    <div className="container-challenge">
      <h1>Desafios e Partidas</h1>
      <SearchBar onSearch={handleSearch} />
      <h2 className="section-title">Desafie Seus Amigos</h2>
      <div className="students-grid">
        {students.content.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onChallenge={handleChallenge}
            handleOpenModal={handleOpenModal}
          />
        ))}
      </div>
      <PendingChallenges />

      <FunctionModal
        code={modalCode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      {/* Modal Popup para exibir o feedback do desafio */}
      {challengeMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{challengeMessage}</p>
            <button className="modal-button" onClick={closeModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenge;
