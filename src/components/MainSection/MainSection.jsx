import "./MainSection.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

import Cosmo from "../../assets/cosmo-avatar.png";
import Timmy from "../../assets/timmy.png";
import Wanda from "../../assets/wanda.png";
import Logo from "../../assets/logo.png";
import AuthContext from "../../context/AuthContext";

export default function MainSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const firstName = (user?.name && String(user.name).split(" ")[0]) || "aluno";

  return (
    <div className="home-main">
      {/* HERO */}
      <section className="home-hero">
        {isAuthenticated ? (
          <div className="home-hero-card home-hero-card--logged">
            <div className="hero-left hero-left--logged">
              <h1 className="hero-title">Bem-vindo de volta, {firstName}!</h1>

              <p className="hero-subtitle">
                Escolha por onde continuar: Envie funções em nossos jogos,
                desafie seus colegas, entre em torneios ou acompanhe o ranking
                global.
              </p>

              <div className="hero-quick-grid">
                <button
                  type="button"
                  className="hero-quick-card"
                  onClick={() => navigate("/games")}
                >
                  <span className="hero-quick-label">Jogos</span>
                  <span className="hero-quick-text">
                    Ver jogos disponíveis e enviar suas funções.
                  </span>
                </button>

                <button
                  type="button"
                  className="hero-quick-card"
                  onClick={() => navigate("/challenges")}
                >
                  <span className="hero-quick-label">Desafios</span>
                  <span className="hero-quick-text">
                    Desafiar seus amigos para um duelo.
                  </span>
                </button>

                <button
                  type="button"
                  className="hero-quick-card"
                  onClick={() => navigate("/tournament")}
                >
                  <span className="hero-quick-label">Torneios</span>
                  <span className="hero-quick-text">
                    Ver torneios abertos e acompanhar os torneios que você
                    participa.
                  </span>
                </button>

                <button
                  type="button"
                  className="hero-quick-card"
                  onClick={() => navigate("/ranking")}
                >
                  <span className="hero-quick-label">Ranking</span>
                  <span className="hero-quick-text">
                    Acompanhar o Ranking geral.
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="home-hero-card">
            <div className="hero-left">
              <h1 className="hero-title">
                Aprenda programação jogando com o Wanda
              </h1>

              <p className="hero-subtitle">
                Uma plataforma para praticar lógica de programação dentro de
                jogos de carta, com duelos, torneios e feedback guiado por
                assistentes virtuais.
              </p>

              <div className="hero-actions">
                <button
                  className="hero-btn hero-btn-primary"
                  onClick={() => navigate("/login")}
                >
                  Entrar e começar a jogar
                </button>

                <button
                  className="hero-btn hero-btn-secondary"
                  onClick={() => scrollToSection("games-section")}
                >
                  Ver jogos disponíveis
                </button>
              </div>

              <p className="hero-note">
                Ideal para alunos iniciantes em programação.
              </p>
            </div>

            <div className="hero-right">
              <img src={Logo} alt="Logo do Wanda" className="hero-logo" />
            </div>
          </div>
        )}
      </section>
      {/* PAINEL — SELETIVO DE BOLSAS */}
      <section className="home-section home-section--notice" id="bolsas">
        <div className="home-section-header">
          <span className="home-section-eyebrow">Inscrições abertas</span>
          <h2 className="home-section-title">Seletivo de bolsas do Wanda</h2>
          <p className="home-section-lead">
            Participe do seletivo e acompanhe todas as informações oficiais do
            processo. Última atualização: documentos de 28 de janeiro. Os
            documentos abaixo estão em PDF.
          </p>
        </div>

        <div className="home-notice-grid">
          <div className="home-notice-card home-notice-card--single">
            <h3 className="home-notice-title">
              Mais informações sobre o processo.
            </h3>

            <p className="home-notice-text">
              O Projeto Wanda é uma iniciativa educacional que utiliza jogos de
              cartas e recursos tecnológicos para apoiar o ensino de lógica de
              programação. Vinculado à UFMA e aprovado no Edital CAPES
              InovaEDUCAÇÃO, o projeto busca promover inovação pedagógica,
              aprendizado ativo e uso de tecnologias educacionais de acesso
              público. Esta chamada pública tem como objetivo selecionar
              estudantes de graduação e pós-graduação da área de Ciência da
              Computação para atuação em atividades de pesquisa e
              desenvolvimento, contribuindo para a criação e aprimoramento de
              soluções educacionais baseadas em card games.
            </p>

            <div className="home-notice-divider" />

            <div className="home-notice-meta">
              <p className="home-notice-meta-title">
                Documentos do processo (PDF)
              </p>
            </div>

            <div className="home-notice-actions home-notice-actions--stack">
              <a
                className="home-notice-btn home-notice-btn--info home-notice-btn--info-strong"
                href="/Resultado_Definitivo_wanda.pdf"
                target="_blank"
                rel="noreferrer"
                title="Resultado definitivo — 28 de janeiro (PDF)"
              >
                Resultado definitivo{" "}
                <span className="home-notice-date">28 jan</span>
              </a>

              <a
                className="home-notice-btn home-notice-btn--info home-notice-btn--info-strong"
                href="/Inscricoes_Homologadas_wanda.pdf"
                target="_blank"
                rel="noreferrer"
                title="Inscrições homologadas — 28 de janeiro (PDF)"
              >
                Inscrições homologadas{" "}
                <span className="home-notice-date">28 jan</span>
              </a>

              <a
                className="home-notice-btn home-notice-btn--info home-notice-btn--info-strong"
                href="/Analise_de_Recursos_wanda.pdf"
                target="_blank"
                rel="noreferrer"
                title="Análise de recursos — 28 de janeiro (PDF)"
              >
                Análise de recursos{" "}
                <span className="home-notice-date">28 jan</span>
              </a>

              <a
                className="home-notice-btn home-notice-btn--info"
                href="/Homologacao_de_Inscricoes_wanda.pdf"
                target="_blank"
                rel="noreferrer"
                title="Homologação das inscrições — 26 de janeiro (PDF)"
              >
                Homologação das inscrições{" "}
                <span className="home-notice-date">26 jan</span>
              </a>

              <a
                className="home-notice-btn home-notice-btn--info"
                href="/Resultado_Provisorio_wanda.pdf"
                target="_blank"
                rel="noreferrer"
                title="Resultado provisório — 26 de janeiro (PDF)"
              >
                Resultado provisório{" "}
                <span className="home-notice-date">26 jan</span>
              </a>

              <a
                className="home-notice-btn home-notice-btn--primary home-notice-btn--download"
                href="/edital-wanda.pdf"
                target="_blank"
                rel="noreferrer"
                title="Edital — 19 de janeiro (PDF)"
              >
                Baixar edital{" "}
                <span className="home-notice-date home-notice-date--on-primary">
                  19 jan
                </span>
              </a>
            </div>
            <p className="home-notice-footnote">
              Última atualização: documentos de <strong>28 jan</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* O QUE É O WANDA */}
      <section className="home-section" id="sobre">
        <div className="home-section-header">
          <h2 className="home-section-title">O que é o Wanda?</h2>
          <p className="home-section-lead">
            O Wanda é um ambiente em que você escreve funções em Python e vê o
            resultado delas em jogos. Em vez de exercícios soltos, você cria
            estratégias que realmente vão para a arena.
          </p>
        </div>

        <div className="home-columns">
          <div className="home-column">
            <h3 className="home-column-title">Pensado para iniciantes</h3>
            <ul className="home-list">
              <li>Explica o contexto dos jogos antes de pedir código.</li>
              <li>Foco em regras simples, mas com espaço para criatividade.</li>
              <li>Permite errar, testar, ajustar e tentar de novo.</li>
            </ul>
          </div>

          <div className="home-column">
            <h3 className="home-column-title">Aprendizado guiado</h3>
            <ul className="home-list">
              <li>
                Assistentes que explicam o que está acontecendo no código.
              </li>
              <li>
                Feedback sobre retornos inválidos, fallbacks e estratégias.
              </li>
              <li>
                Relatórios de partidas para entender o comportamento do bot.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* JOGOS DISPONÍVEIS */}
      <section className="home-section home-section--games" id="games-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Jogos disponíveis</h2>
          <p className="home-section-lead">Explore nossos jogos.</p>
        </div>

        <div className="home-games-grid">
          {/*JOKENPO*/}
          <article className="home-game-card">
            <h3 className="home-game-title">Jokenpô</h3>
            <p className="home-game-description">
              O clássico pedra, papel e tesoura, onde você cria duas funções
              para escolher suas cartas ao longo dos 3 rounds.
            </p>

            <ul className="home-game-points">
              <li>Funções com poucos parâmetros.</li>
              <li>Condicionais e decisões simples.</li>
              <li>Ótimo para primeiro contato com o Wanda.</li>
            </ul>

            <div className="home-game-footer">
              <span className="home-game-skill-tag">
                Foco: estrututuras condicionais, parâmetros, variáveis, tipos
                primitivos..
              </span>
              <button
                className="home-game-btn"
                onClick={() => navigate("/games")}
              >
                Enviar função para este jogo
              </button>
            </div>
          </article>

          {/*BITS*/}
          <article className="home-game-card">
            <h3 className="home-game-title">BITS</h3>
            <p className="home-game-description">
              Cada rodada, seu bot escolhe entre as cartas: BIT8, BIT16, BIT32 e
              FIREWALL. A ideia, é escrever uma única função que selecione a sua
              carta ao longo dos 4 rounds de uma partida!
            </p>

            <ul className="home-game-points">
              <li>
                Uso de estruturas condicionais e entendimento dos tipos de
                variáveis
              </li>
              <li>Leitura de relatórios para ajustar a estratégia.</li>
              <li>Ótimo para primeiro contato com o Wanda.</li>
            </ul>

            <div className="home-game-footer">
              <span className="home-game-skill-tag">
                Foco: Estruturas condicionais, parâmetros, variáveis, None,
                tipos primitivos...
              </span>
              <button
                className="home-game-btn"
                onClick={() => navigate("/games")}
              >
                Enviar função para este jogo
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ASSISTENTES VIRTUAIS */}
      <section className="home-section home-section--agents" id="assistentes">
        <div className="home-section-header">
          <h2 className="home-section-title">Assistentes virtuais</h2>
          <p className="home-section-lead">
            Você não precisa descobrir tudo sozinho. Cada assistente tem um
            estilo diferente de explicação para te ajudar durante o processo.
          </p>
        </div>

        <div className="agents-grid">
          <article className="agent-card">
            <img src={Cosmo} alt="Cosmo" className="agent-avatar" />
            <h3 className="agent-name">Cosmo</h3>
            <p className="agent-role">Explicações bem detalhadas</p>
            <p className="agent-description">
              Respostas mais longas, cheias de exemplos e explicações passo a
              passo. Bom para quando você quer entender o &quot;porquê&quot; de
              cada coisa.
            </p>
          </article>

          <article className="agent-card">
            <img src={Timmy} alt="Timmy" className="agent-avatar" />
            <h3 className="agent-name">Timmy</h3>
            <p className="agent-role">Direto ao ponto</p>
            <p className="agent-description">
              Fala pouco, mas vai direto ao que importa. Útil quando você já tem
              uma noção e só precisa de um empurrãozinho.
            </p>
          </article>

          <article className="agent-card">
            <img src={Wanda} alt="Wanda" className="agent-avatar" />
            <h3 className="agent-name">Wanda</h3>
            <p className="agent-role">Equilíbrio</p>
            <p className="agent-description">
              Mistura de clareza e objetividade. Nem tão curto quanto o Timmy,
              nem tão longo quanto o Cosmo: o meio-termo ideal.
            </p>
          </article>
        </div>
      </section>

      {/* FLUXO DE USO */}
      <section className="home-section home-section--flow" id="fluxo">
        <div className="home-section-header">
          <h2 className="home-section-title">Como funciona na prática?</h2>
          <p className="home-section-lead">
            O foco é aprender a programar. Os jogos e torneios são o cenário
            onde esse aprendizado acontece.
          </p>
        </div>

        <div className="flow-grid">
          <div className="flow-step">
            <div className="flow-step-number">1</div>
            <h3 className="flow-step-title">Escreva sua função</h3>
            <p className="flow-step-text">
              Você recebe a assinatura da função <code>strategy</code> com os
              parâmetros e o contexto do jogo.
            </p>
          </div>

          <div className="flow-step">
            <div className="flow-step-number">2</div>
            <h3 className="flow-step-title">Peça ajuda aos assistentes</h3>
            <p className="flow-step-text">
              Use os agentes para revisar, comentar e sugerir ajustes na sua
              lógica.
            </p>
          </div>

          <div className="flow-step">
            <div className="flow-step-number">3</div>
            <h3 className="flow-step-title">Teste e acompanhe o resultado</h3>
            <p className="flow-step-text">
              O sistema roda partidas e mostra onde sua função funcionou bem ou
              precisou de fallback.
            </p>
          </div>

          <div className="flow-step">
            <div className="flow-step-number">4</div>
            <h3 className="flow-step-title">Entre em duelos e torneios</h3>
            <p className="flow-step-text">
              Quando estiver confiante, participe de partidas contra colegas e
              acompanhe sua evolução no ranking.
            </p>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="home-section home-section--cta" id="cta">
          <div className="home-section-header">
            <h2 className="home-section-title">Pronto para começar?</h2>
            <p className="home-section-lead">
              Crie sua conta, envie sua primeira função e veja o seu bot
              entrando em jogo nas arenas do Wanda.
            </p>
          </div>

          <div className="cta-actions">
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </button>

            <button
              className="hero-btn hero-btn-secondary"
              onClick={() => navigate("/login")}
            >
              Já tenho conta
            </button>

            <button
              type="button"
              className="cta-link"
              onClick={() => scrollToSection("games-section")}
            >
              Ver jogos antes de entrar
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
