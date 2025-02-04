// ProfilePage.jsx
import { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfilePage/ProfileHeader";
import "../components/ProfilePage/ProfilePage.css";
import ProfileMatches from "../components/ProfilePage/ProfileMacthes";

function ProfilePage() {
  const [profileData, setProfileData] = useState(null);

  // Simular a requisição do backend (use axios ou fetch na prática)
  useEffect(() => {
    const data = {
      id: 4,
      nickname: "testuser",
      numberOfMatches: 10,
      numberOfWinners: 7,
      function:
        '\ndef strategy(card1, card2, card3, opponentCard1, opponentCard2, opponentCard3):\n    return "pedra"\n',
      badges: [
        { id: 1, name: "Champion", description: "Won 5 matches", icon: "🏆" },
        {
          id: 2,
          name: "Rookie",
          description: "First match played",
          icon: "⭐",
        },
      ],
      matches: [
        { id: 1, opponent: "Opponent1", result: "Win", date: "2023-02-03" },
        { id: 2, opponent: "Opponent2", result: "Loss", date: "2023-02-04" },
        { id: 3, opponent: "Opponent3", result: "Win", date: "2023-02-05" },
      ],
      challenges: [
        {
          id: 1,
          challenger: "Friend1",
          message: "Challenge you to a match",
          date: "2023-02-05",
        },
      ],
    };

    // Simula um delay de 500ms para a requisição
    setTimeout(() => {
      setProfileData(data);
    }, 500);
  }, []);

  if (!profileData) {
    return <div className="profile-page">Carregando...</div>;
  }

  return (
    <div className="profile-page">
      <ProfileHeader
        nickname={profileData.nickname}
        numberOfMatches={profileData.numberOfMatches}
        numberOfWinners={profileData.numberOfWinners}
      />
      <div className="profile-content">
        <ProfileMatches matches={profileData.matches} />
      </div>
    </div>
  );
}

export default ProfilePage;
