import SearchBar from "../components/Challenges/SearchBar";
import StudentCard from "../components/Challenges/StudentCard";
import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import "../components/Challenges/Challenge.css";
import AuthContext from "../context/AuthContext";
import PendingChallenges from "../components/Challenges/PendingChallenges";
import FunctionModal from "../components/Challenges/FunctionModal";
import Pagination from "../components/Challenges/Pagination";
import BadgePreviewModal from "../components/Challenges/BadgePreviewModal";

const Challenge = () => {
  const [students, setStudents] = useState({ content: [], totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalFunctions, setModalFunctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [challengeMessage, setChallengeMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const { token } = useContext(AuthContext);

  const fetchStudents = useCallback(
    async (term = "", page = 0) => {
      try {
        const url = "http://localhost:8080/jokenpo/findByName";
        const response = await axios.get(url, {
          params: { name: term, size: 4, page },
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(response.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Erro ao buscar estudantes:", error);
      }
    },
    [token]
  );

  useEffect(() => {
    const id = setTimeout(() => fetchStudents(searchTerm, currentPage), 500);
    return () => clearTimeout(id);
  }, [searchTerm, currentPage, fetchStudents]);

  useEffect(() => {
    fetchStudents("", 0);
  }, [fetchStudents]);

  const handleSearch = (term) => setSearchTerm(term);

  const handleChallenge = async (challengedId) => {
    try {
      const url = "http://localhost:8080/jokenpo/challenge";
      await axios.post(
        url,
        { challengedId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChallengeMessage("Desafio enviado com sucesso!");
    } catch (error) {
      if (error.response?.status === 404) {
        setChallengeMessage("Adversário não encontrado!");
      } else if (
        error.response?.status === 400 &&
        error.response.data?.error === "Já existe um desafio pendente!"
      ) {
        setChallengeMessage("Já existe um desafio pendente!");
      } else {
        setChallengeMessage("Erro ao enviar o desafio.");
      }
    }
  };

  const closeModal = () => setChallengeMessage("");

  // **Mudança aqui**: agora recebe o objeto `student` inteiro
  const handleOpenModal = (student) => {
    setModalFunctions([
      { name: "Função 1", code: student.code },
      { name: "Função 2", code: student.code2 },
    ]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalFunctions([]);
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
            // **Mudança aqui**: passamos o student inteiro
            onViewFunctions={() => handleOpenModal(student)}
            onBadgeClick={(badge) => setSelectedBadge(badge)}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <PendingChallenges />

      <FunctionModal
        functions={modalFunctions}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <BadgePreviewModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />

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
