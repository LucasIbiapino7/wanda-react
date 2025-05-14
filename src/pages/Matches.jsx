import  { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Arena from "../components/Arena/Arena";

function Matches() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !token) return;
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${import.meta.env.VITE_API_URL}/jokenpo/match/${id}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMatch(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados da partida:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id, token]);

  if (loading) {
    return <div>Carregando dados do duelo...</div>;
  }
  if (error) {
    return <div>Erro ao carregar duelo: {error.message || "Tente novamente."}</div>;
  }
  if (!match) {
    return null;
  }

  return (
    <>
      <Arena duelData={match} />
    </>
  );
}

export default Matches;

