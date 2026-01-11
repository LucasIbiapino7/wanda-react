import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import CreateTournamentModal from "../components/Tournament/CreateTournamentModal";
import "../components/Tournament/Tournament.css";
import OpenTournaments from "../components/Tournament/OpenTournaments";
import ParticipatingTournaments from "../components/Tournament/ParticipatingTournaments";
import AppModal from "../components/UI/AppModal";
import TournamentService from "../services/TournamentService";

export default function Tournament() {
  const { isAdmin, isInstructor } = useContext(AuthContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleCreateTournament = async ({
    name,
    description,
    startTime,
    maxParticipants,
    gameName,
  }) => {
    try {
      await TournamentService.create({
        name,
        description,
        startTime,
        asPrivate: false,
        password: "",
        maxParticipants,
        gameName,
      });
      setModalOpen(false);

      setSuccessModal({
        open: true,
        message: `O torneio "${name}" foi criado com sucesso! 🎉`,
      });
    } catch (err) {
      console.log(err)
      throw err; 
    }
  };

  const handleCloseSuccess = () =>
    setSuccessModal((s) => ({ ...s, open: false }));

  return (
    <div className="container-tournament">
      <h1>Torneios</h1>

      {(isAdmin || isInstructor) && (
        <button
          className="primary-button floating-create-button"
          onClick={handleOpenModal}
          title="Criar novo torneio"
        >
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

      {/* Modal de sucesso */}
      <AppModal
        open={successModal.open}
        onClose={handleCloseSuccess}
        title="Torneio criado!"
        variant="success"
        primaryAction={{
          id: "ok-success",
          label: "Ok",
          onClick: handleCloseSuccess,
        }}
        initialFocus="ok-success"
      >
        <p>{successModal.message}</p>
      </AppModal>
    </div>
  );
}
