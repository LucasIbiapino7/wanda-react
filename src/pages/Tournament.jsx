import { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import CreateTournamentModal from "../components/Tournament/CreateTournamentModal";
import "../components/Tournament/Tournament.css";

export default function Tournament() {
  const { token, isAdmin } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleCreateTournament = async ({
    name,
    description,
    startTime,
    maxParticipants,
  }) => {
    try {
      // monta o corpo da requisição
      const body = {
        name,
        description,
        startTime,
        asPrivate: false,
        password: "",
        maxParticipants,
      };
      await axios.post("http://localhost:8080/tournament", body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // só fecha o modal depois do sucesso
      setModalOpen(false);
      // aqui você pode exibir um toast de sucesso, recarregar lista etc.
    } catch (err) {
      console.error("Erro ao criar torneio:", err);
      // exiba um toast ou mensagem de erro, deixando o modal aberto
    }
  };

  return (
    <div className="container-tournament">
      <h1>Torneios</h1>

      {isAdmin && (
        <button className="primary-button" onClick={handleOpenModal}>
          + Novo Torneio
        </button>
      )}

      <CreateTournamentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateTournament}
      />

      {/* TODO: aqui depois entraremos com a lista de torneios */}
    </div>
  );
}
