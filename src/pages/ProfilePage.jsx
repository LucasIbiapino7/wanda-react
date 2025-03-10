// ProfilePage.jsx
import { useEffect, useState, useContext } from "react";
import ProfileHeader from "../components/ProfilePage/ProfileHeader";
import "../components/ProfilePage/ProfilePage.css";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import ProfileMatches from "../components/ProfilePage/ProfileMacthes";
import ProfileChallenges from "../components/ProfilePage/ProfileChallenges";
import ProfileFunction from "../components/ProfilePage/ProfileFunction";

function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const { token } = useContext(AuthContext);

  // Simular a requisição do backend (use axios ou fetch na prática)
  useEffect(() => {
    // Função assíncrona para buscar os dados do perfil
    const fetchProfileData = async () => {
      try {
        // Faz uma requisição GET para o endpoint do perfil,
        // enviando o token no cabeçalho para autenticação.
        const response = await axios.get("http://localhost:8080/jokenpo/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Atualiza o estado com os dados retornados
        setProfileData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Erro ao obter dados do perfil:", error);
      }
    };

    // Se o token estiver disponível, realiza a requisição
    if (token) {
      fetchProfileData();
    }
  }, [token]);

  if (!profileData) {
    return <div className="profile-page">Carregando...</div>;
  }

  return (
    <div className="profile-page">
      <ProfileHeader
        nickname={profileData.nickname}
        numberOfMatches={profileData.numberOfMatches}
        numberOfWinners={profileData.numberOfWinners}
        badges={profileData.badges}
      />
      <div className="profile-content">
        <ProfileMatches matches={profileData.matches} />
        <ProfileChallenges challenges={profileData.challenges} />
        <ProfileFunction functionCode={profileData.function} />
      </div>
    </div>
  );
}

export default ProfilePage;
