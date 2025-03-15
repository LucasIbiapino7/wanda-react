import SearchBar from "../components/Challenges/SearchBar";
import StudentCard from "../components/Challenges/StudentCard";
import { useState } from "react";
import "../components/Challenges/Challenge.css"

const Challenge = () => {
  const [students, setStudents] = useState({
    content: [
      {
        id: 1,
        name: "João Silva",
        badges: ["js", "python"],
        code: "def movimento():\n    print('Hello World')",
      },
      {
        id: 2,
        name: "Maria Souza",
        badges: ["react"],
        code: null,
      },
    ],
    totalPages: 1,
  });

  const handleSearch = (term) => {
    console.log("Buscar por:", term);
    // Implementar lógica de busca aqui
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
