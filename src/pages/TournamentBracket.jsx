import { useParams } from "react-router-dom";
import BracketViewer from "../components/BracketViewer/BracketViewer";

function TournamentBracket() {
  const { id } = useParams();
  console.log(id);

  return(
    <BracketViewer tournamentId={Number(id)} />
  )
}

export default TournamentBracket;
