import { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import CreateTournamentModal from "../components/Tournament/CreateTournamentModal";
import "../components/Tournament/Tournament.css";
import OpenTournaments from "../components/Tournament/OpenTournaments";
import ParticipatingTournaments from "../components/Tournament/ParticipatingTournaments";

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
      const body = {
        name,
        description,
        startTime,
        asPrivate: false,
        password: "",
        maxParticipants,
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/tournament`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar torneio:", err);
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

      <OpenTournaments />

      <ParticipatingTournaments />
    </div>
  );
}
