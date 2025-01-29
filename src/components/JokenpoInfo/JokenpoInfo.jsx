import Cards from "../../assets/jpkenpo-cartas.png"
import Duels from "../../assets/jokenpo-duelos.png"
import Accordion from "../Accordion/Accordion";
import "./JokenpoInfo.css"

function JokenpoInfo() {
  return (
    <div className="container">
      <div className="jokenpo-info">
        <h1>Regras do Jogo - Jokenpo</h1>
        <Accordion
          title="Nome do Jogo"
          content="O jogo se chama Jokenpo, uma versão digitalizada e gamificada do clássico Pedra, Papel e Tesoura."
        />
        <Accordion
          title="Cartas"
          content="As cartas disponíveis no jogo são: Pedra, Papel e Tesoura. Cada carta tem sua própria funcionalidade e é usada durante os duelos."
          image={Cards}
        />
        <Accordion
          title="Duelo"
          content="O jogo consiste em duelos entre dois adversários. Cada jogador utiliza suas cartas estrategicamente para vencer."
          image={Duels}
        />
        <Accordion
          title="Envio de Funções"
          content="Os jogadores devem enviar suas funções escritas em Python. As funções são usadas para decidir as estratégias durante um duelo."
        />
      </div>
    </div>
  );
}

export default JokenpoInfo;
