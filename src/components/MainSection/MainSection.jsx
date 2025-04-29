import "./MainSection.css";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero-bg.png";
import Wanda from "../../assets/wanda.png";
import Timmy from "../../assets/timmy.png";
import Cosmo from "../../assets/cosmo-avatar.png";
import FeedbackIcon from "../../assets/feedbackIcon.png";
import RunIcon from "../../assets/runIcon.png";
import SubmitIcon from "../../assets/submitIcon.png";
import MatchImg from "../../assets/arena-background-pixel-art.png";

export default function MainSection() {
  const navigate = useNavigate();
  const scrollToIntro = () => {
    const section = document.querySelector(".intro-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <>
      <section className="main-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Bem-vindo ao Wanda</h1>
            <p className="hero-subtitle">
              Escreva e teste suas estratégias de Jokenpô com agentes
              inteligentes.
            </p>
            <button className="hero-button" onClick={scrollToIntro}>Começar agora</button>
          </div>
          <div className="hero-image">
            <img src={heroImage} alt="Ilustração de Jokenpô com agentes" />
          </div>
        </div>
      </section>
      <section className="intro-section">
        <div className="intro-card">
          <h2 className="intro-title">Como funciona o Jokenpô?</h2>
          <p className="intro-text">
            Aqui você pode jogar uma partida do clássico jogo Jokenpô contra
            seus amigos e participar de torneios, mas como você vai escolher a
            carta que vai ser jogada em cada rodada? Essa responsabilidade é
            sua! Você vai escrever a lógica de duas funções em Python que
            determinam qual carta (pedra, papel ou tesoura) será jogada no
            primeiro e no segundo round de uma partida!
          </p>
        </div>
      </section>

      <section className="section-round1">
        <div className="round1-card">
          <div className="round1-header">
            <h2>Função do Primeiro Round!</h2>
            <p>
              No primeiro round você conhece as <strong>3 cartas</strong> na sua
              mão, por meio dos parâmetros: card1, card2 e card3. Sendo assim,
              você deve escrever a lógica da função strategy, pensando em uma
              estratégia para escolher sua carta! Vale lembrar, que no início de
              cada partida as cartas são distribuídas entre os dois jogadores, e
              pode ocorrer de você ter duas cartas repetidas na sua mão, como:
              pedra, pedra e tesoura.
            </p>
          </div>
          <div className="round1-editor">
            <div className="editor-toolbar">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <pre className="editor-content">
              <code>
                {`function strategy(card1, card2, card3):
  # sua estratégia aqui
`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="section-round2">
        <div className="round2-card">
          <div className="round2-header">
            <h2>Função do Segundo Round!</h2>
            <p>
              No segundo round você conhece as suas <strong>2 cartas</strong> e
              as <strong>2 cartas do adversário</strong>. Sendo assim, você deve
              escrever a lógica da função strategy, pensando em uma estratégia
              para escolher sua carta!
            </p>
          </div>
          <div className="round2-editor">
            <div className="editor-toolbar">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <pre className="editor-content">
              <code>
                {`function strategy(card1, card2, opponentCard1, opponentCard2): 
  # seu código aqui
`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="assist-section">
        <h2 className="assist-title">Conheça os nossos assistentes!</h2>
        <p className="assist-text">
          Enquanto escreve suas funções, você pode pedir a ajuda de um dos
          nossos assistentes virtuais! Cada um deles tem uma personalidade
          própria, mas pode ter certeza que eles podem te ajudar bastante!
          Claro, cada um da sua forma!
        </p>
        <div className="assist-cards">
          <div className="assist-card">
            <img src={Cosmo} alt="Cosmo" className="assist-photo" />
            <h3>Cosmo</h3>
            <p>
              Olá, meu nome é Cosmo. Minhas respostas são as mais longas, adoro
              falar!
            </p>
          </div>
          <div className="assist-card">
            <img src={Timmy} alt="Timmy" className="assist-photo" />
            <h3>Timmy</h3>
            <p>Sou o Timmy. Vou ser o mais direto possível.</p>
          </div>
          <div className="assist-card">
            <img src={Wanda} alt="Wanda" className="assist-photo" />
            <h3>Wanda</h3>
            <p>
              Sou Wanda! Minhas respostas são em um estilo mais equilibrado do
              que a dos outros dois!
            </p>
          </div>
        </div>
      </section>

      <section className="agent-actions-section">
        <h2 className="agent-actions-title">
          Veja como eles podem ajudar você:
        </h2>
        <div className="agent-actions-cards">
          <div className="agent-action-card">
            <img
              src={FeedbackIcon}
              alt="Feedback"
              className="agent-action-icon"
            />
            <h3 className="agent-action-name">Feedback</h3>
            <p className="agent-action-text">
              Analise semântica do seu código: os agentes apontam pontos de
              melhoria e verificam como você está usando os parâmetros da sua
              função!
            </p>
          </div>
          <div className="agent-action-card">
            <img src={RunIcon} alt="Rodar" className="agent-action-icon" />
            <h3 className="agent-action-name">Rodar</h3>
            <p className="agent-action-text">
              Sua função é executada com entradas reais e é verificado como ela
              se sai e se está retornando os valores dentro do esperado.
            </p>
          </div>
          <div className="agent-action-card">
            <img
              src={SubmitIcon}
              alt="Submeter"
              className="agent-action-icon"
            />
            <h3 className="agent-action-name">Submeter</h3>
            <p className="agent-action-text">
              Aqui você salva sua função e pode começar a se divertir desafiando
              seus amigos!
            </p>
          </div>
        </div>
      </section>

      <section className="validation-section">
        <h2 className="validation-title">Validação Automática do Código</h2>
        <div className="validation-card">
          <p className="validation-text">
            Além disso, nossos agentes realizam uma checagem automática no seu
            código ao apertar qualquer um dos botões:
          </p>
          <ul className="validation-list">
            <li>Sintaxe válida e sem erros de indentação</li>
            <li>
              Presença obrigatória da função <code>strategy</code>
            </li>
            <li>Parâmetros corretos conforme cada round</li>
          </ul>
          <p className="validation-note">
            Caso algum problema seja detectado, você vai receber um feedback dos
            nossos assistentes, ajudando você a entender e corrigir o erro!
          </p>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Pronto para jogar de verdade?</h2>
          <p className="cta-text">
            Agora que já sabe como funciona, que tal submerter suas funções?
            Depois disso, pode desafiar seus amigos ou entrar em torneios e
            testar sua estratégia! Cada vitória conta no ranking e você pode ganhar algumas
            badges exclusivas.
          </p>
          <button
            className="cta-button"
            onClick={() => (navigate("/jokenpo1"))}
          >
            Enviar funções
          </button>
          <img src={MatchImg} alt="Exemplo de Partida" className="cta-image" />
        </div>
      </section>
    </>
  );
}
