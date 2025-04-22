import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../components/ProfilePage/ProfilePage.css";

export default function ProfilePage() {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFunc, setActiveFunc] = useState(1);

  const characters = [
    "p1.png",
    "p2.png",
    "p3.png",
    "p4.png",
    "p5.png",
    "p6.png",
  ];
  const [selectedChar, setSelectedChar] = useState(null);
  const [updatingChar, setUpdatingChar] = useState(false);
  const [initialChar, setInitialChar] = useState(null);
  const [charMessage, setCharMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await axios.get(
          "http://localhost:8080/jokenpo/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(data);
        setInitialChar(data.characterUrl);
        setSelectedChar(data.characterUrl);
      } catch {
        setError("Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  const handleCharSelect = (url) => {
    setSelectedChar(url);
  };

  const handleConfirmCharacter = async () => {
    // só envia se mudou
    if (selectedChar === initialChar) return;
    setUpdatingChar(true);
    try {
      await axios.put(
        "http://localhost:8080/jokenpo/profile/character",
        { characterUrl: selectedChar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInitialChar(selectedChar);
      setCharMessage("Personagem atualizado!");
    } catch {
      setCharMessage("Erro ao atualizar personagem.");
    } finally {
      setUpdatingChar(false);
      setTimeout(() => setCharMessage(""), 3000);
    }
  };

  if (loading) return <div className="pp-loading">Carregando perfil...</div>;
  if (error) return <div className="pp-error">{error}</div>;

  const {
    name,
    nickname,
    characterUrl,
    numberOfMatches,
    numberOfWinners,
    winsTournaments,
    function1,
    function2,
    badges,
  } = profile;

  return (
    <div className="pp-container">
      <div className="pp-header">
        <div
          className="pp-avatar"
          style={{
            backgroundImage: `url(/assets/personagens/${characterUrl})`,
          }}
        />
        <div className="pp-user-info">
          <h1 className="pp-name">olá, {name}!</h1>
        </div>
      </div>

      <section className="pp-character-select">
        <h2>Escolha seu personagem</h2>
        <div className="pp-char-grid">
          {characters.map((c) => (
            <div
              key={c}
              className={
                "pp-char-option" +
                (c === selectedChar ? " pp-char-option--active" : "")
              }
              onClick={() => handleCharSelect(c)}
            >
              <img src={`/assets/personagens/${c}`} alt={c} />
            </div>
          ))}
        </div>
        <button
          className="pp-char-confirm-btn"
          onClick={handleConfirmCharacter}
          disabled={updatingChar || selectedChar === initialChar}
        >
          {updatingChar ? "Enviando..." : "Confirmar Personagem"}
        </button>

        {charMessage && <p className="pp-char-msg">{charMessage}</p>}
      </section>

      <section className="pp-stats">
        <div className="pp-stat pp-stat--highlight">
          <span className="pp-stat-value">{numberOfMatches}</span>
          <span className="pp-stat-label">Partidas jogadas</span>
        </div>
        <div className="pp-stat pp-stat--highlight">
          <span className="pp-stat-value">{numberOfWinners}</span>
          <span className="pp-stat-label">Vitórias em partidas</span>
        </div>
        <div className="pp-stat pp-stat--highlight">
          <span className="pp-stat-value">{winsTournaments}</span>
          <span className="pp-stat-label">Torneios vencidos</span>
        </div>
      </section>

      <section className="pp-badges">
        <h2>Badges</h2>
        {badges.length > 0 ? (
          <div className="pp-badges-list">
            {badges.map((b) => (
              <img
                key={b.id}
                src={`/assets/badges/${b.iconUrl}`}
                alt={b.name}
                title={b.name}
                className="pp-badge"
              />
            ))}
          </div>
        ) : (
          <p className="pp-no-badges">Você ainda não possui badges.</p>
        )}
      </section>

      <section className="pp-functions">
        <h2>Funções</h2>
        <div className="pp-func-tabs">
          <button
            className={
              "pp-func-tab" + (activeFunc === 1 ? " pp-func-tab--active" : "")
            }
            onClick={() => setActiveFunc(1)}
          >
            Jokenpo 1
          </button>
          <button
            className={
              "pp-func-tab" + (activeFunc === 2 ? " pp-func-tab--active" : "")
            }
            onClick={() => setActiveFunc(2)}
          >
            Jokenpo 2
          </button>
        </div>
        <div className="pp-func-content">
          <pre>
            <code className="language-python">
              {activeFunc === 1 ? function1 : function2}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}
