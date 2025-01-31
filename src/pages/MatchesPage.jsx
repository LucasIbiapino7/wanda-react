import { useState, useEffect, useContext } from "react";
import "../components/MatchesPage/MatchesPage.css";
import axios from "axios";
import AuthContext from "../context/AuthContext.jsx";

// Simular o retorno do backend
const mockStudents = [
  { id: 1, name: "Aluno 1" },
  { id: 2, name: "Aluno 2" },
  { id: 3, name: "Aluno 3" },
  { id: 4, name: "Aluno 4" },
  { id: 5, name: "Aluno 5" },
  { id: 6, name: "Aluno 6" },
  { id: 7, name: "Aluno 7" },
  { id: 8, name: "Aluno 8" },
  { id: 9, name: "Aluno 9" },
  { id: 10, name: "Aluno 10" },
  { id: 11, name: "Aluno 11" },
];


function MatchesPage() {
  const [students, setStudents] = useState([]); // Lista do alunos
  const [selected, setSelected] = useState([]); // Lista dos selecionados
  const [currentPage, setCurrentPage] = useState(1); // Ajuda na paginção
  const [matchReport, setMatchReport] = useState(null); // resultado da partida
  const { token } = useContext(AuthContext);

  const [isMatchStarted, setIsMatchStarted] = useState(false);

  // Quantos alunos por página
  const pageSize = 5;

  // xhamada ao backend, mas no momento simula com mockStudents:
  useEffect(() => {
    // axios.get("URL_DO_BACKEND")
    //   .then((res) => setStudents(res.data))
    //   .catch((err) => console.log(err));
    setStudents(mockStudents);
  }, []);

  // Lógica de paginação
  const totalPages = Math.ceil(students.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = students.slice(startIndex, endIndex);

  // Selecionar/desmarcar aluno
  const handleSelect = (studentId) => {
    if (selected.includes(studentId)) {
      // Se já estava selecionado, removemos
      setSelected(selected.filter((id) => id !== studentId));
    } else {
      // Limitar a 2. Se quiser permitir mais, basta remover esse if.
      if (selected.length < 2) {
        setSelected([...selected, studentId]);
      } else {
        alert("Máximo de 2 alunos selecionados!");
      }
    }
  };

  // Iniciar partida
  const handleStartMatch = async () => {
    if (selected.length === 2) {
      const [playerId1, playerId2] = selected; // Pega os alunos selecionados
      try {
        const response = await axios.post(
          "http://localhost:8080/jokenpo/match",
          {
            playerId1,
            playerId2,
          },
          {
            headers: {
              // Cabeçalho Authorization com Bearer token
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // O back-end retorna algo como:
        // {
        //   player1: { id, name, email },
        //   player2: { id, name, email },
        //   turns: [
        //     { tie, player1Winners, player2Winners, playerWinTurn },
        //     ...
        //   ],
        //   playerWinner: { id, name, email }
        // }
        setMatchReport(response.data);

        // Se quiser zerar a seleção depois de iniciar:
        setSelected([]);
        setIsMatchStarted(true); // Inicia a exibição sequencial
      } catch (error) {
        console.error("Erro ao iniciar partida:", error);
        alert("Ocorreu um erro ao iniciar a partida. Verifique o console.");
      }
    } else {
      alert("Selecione 2 alunos antes de iniciar a partida.");
    }
  };

  // Avançar página
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Voltar página
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="matches-page">
      <h1 className="matches-title">Gerenciar Partida</h1>
      <p className="matches-subtitle">
        Selecione <strong>2 alunos</strong> para iniciar a partida
      </p>

      {/* Lista paginada de alunos */}
      <div className="students-list">
        {paginatedStudents.map((student) => (
          <div key={student.id} className="student-item">
            <label>
              <input
                type="checkbox"
                checked={selected.includes(student.id)}
                onChange={() => handleSelect(student.id)}
              />
              {student.name}
            </label>
          </div>
        ))}
      </div>

      {/* Controles de paginação */}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span className="current-page">
          Página {currentPage} de {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>

      {/* Botão de iniciar partida */}
      <div className="start-match-container">
        <button
          className="start-match-button"
          onClick={handleStartMatch}
          disabled={selected.length !== 2}
        >
          Iniciar Partida
        </button>
      </div>

      {isMatchStarted && matchReport && (
        <div className="match-report">
          <h2>Relatório da Partida</h2>

          {/* Informações dos Jogadores */}
          <div className="players-info">
            <div className="player">
              <h3>Player 1</h3>
              <p>
                <strong>ID:</strong> {matchReport.player1.id}
              </p>
              <p>
                <strong>Nome:</strong> {matchReport.player1.name}
              </p>
              <p>
                <strong>Email:</strong> {matchReport.player1.email}
              </p>
            </div>
            <div className="player">
              <h3>Player 2</h3>
              <p>
                <strong>ID:</strong> {matchReport.player2.id}
              </p>
              <p>
                <strong>Nome:</strong> {matchReport.player2.name}
              </p>
              <p>
                <strong>Email:</strong> {matchReport.player2.email}
              </p>
            </div>
          </div>

          {/* Exibição dos Turnos */}
          <div className="turns-info">
            <h3>Turnos</h3>
            {matchReport.turns.map((turn) => (
              <div key={turn.turnNumber} className="turn-item">
                <h4>Turno {turn.turnNumber}</h4>
                {turn.plays.map((play) => (
                  <div key={play.playNumber} className="play-item">
                    <p>
                      <strong>Jogada {play.playNumber}:</strong>
                    </p>
                    <p>Player 1 escolheu: {play.playerCard1}</p>
                    <p>Player 2 escolheu: {play.playerCard2}</p>
                    {play.tie ? (
                      <p>
                        <em>Empate!</em>
                      </p>
                    ) : (
                      <p>Vencedor da jogada: Player {play.winnerOfPlay}</p>
                    )}
                  </div>
                ))}
                <p>
                  <strong>Vencedor do Turno:</strong> Player{" "}
                  {turn.playerWinTurn}
                </p>
                <p>
                  <strong>Placar:</strong> Player 1:  {turn.player1Winners} |
                  Player 2: - {turn.player2Winners}
                </p>
                <hr />
              </div>
            ))}
          </div>

          {/* Vencedor Final */}
          <div className="winner-info">
            <h3>Vencedor da Partida:</h3>
            <p>
              <strong>ID:</strong> {matchReport.playerWinner.id}
            </p>
            <p>
              <strong>Nome:</strong> {matchReport.playerWinner.name}
            </p>
            <p>
              <strong>Email:</strong> {matchReport.playerWinner.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchesPage;
