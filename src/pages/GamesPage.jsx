import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../components/Games/GamesPage.css";

function GameBannerCard({
  image,
  title,
  description,
  points = [],
  tags = [],
  ctaLabel,
  onCta,
  disabled = false,
  badge,
  accent = "#ffb84d",
}) {
  return (
    <article
      className={"game-banner" + (disabled ? " game-banner--disabled" : "")}
      style={{ "--accent": accent }}
    >
      <div className="game-banner-media">
        <div className="game-banner-media-bg" />
        <img className="game-banner-img" src={image} alt={title} />
      </div>

      <div className="game-banner-content">
        <div className="game-banner-top">
          {badge ? <span className="game-badge">{badge}</span> : null}
          <h2 className="game-title">{title}</h2>
          <p className="game-desc">{description}</p>
        </div>

        <div className="game-banner-mid">
          {points.length ? (
            <ul className="game-points">
              {points.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          ) : null}

          {tags.length ? (
            <div className="game-tags">
              {tags.map((t, idx) => (
                <span key={idx} className="game-tag">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="game-banner-actions">
          <button
            className={"game-cta" + (disabled ? " game-cta--disabled" : "")}
            onClick={onCta}
            disabled={disabled}
            type="button"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

GameBannerCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  points: PropTypes.arrayOf(PropTypes.string),
  tags: PropTypes.arrayOf(PropTypes.string),
  ctaLabel: PropTypes.string.isRequired,
  onCta: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  badge: PropTypes.string,
  accent: PropTypes.string,
};

export default function GamesPage() {
  const navigate = useNavigate();

  const games = [
    {
      key: "bits",
      badge: "Introdução",
      title: "BITS",
      image: "/assets/games/bits-logo.png",
      accent: "#70c2f0",
      description:
        "Cada rodada, seu bot escolhe entre as cartas: BIT8, BIT16, BIT32 e FIREWALL. A ideia, é escrever uma única função que selecione a sua carta ao longo dos 4 rounds de uma partida!",
      points: [
        "Condicionais e decisões simples.",
        "Entender os tipos primitivos e possíveis retornos.",
        "Uso dos assistentes durante a escrita do código.",
      ],
      tags: ["Estruturas condicionais", "Variáveis", "Tipos primitivos"],
      ctaLabel: "Desenvolver função",
      disabled: false,
      onCta: () => navigate("/bits"),
    },
    {
      key: "jokenpo",
      badge: "Introdução",
      title: "Jokenpô",
      image: "/assets/games/jokenpo-logo.png",
      accent: "#ffb84d",
      description:
        "O clássico pedra, papel e tesoura, onde você cria duas funções para escolher suas cartas ao longo dos 3 rounds.",
      points: [
        "Funções com poucos parâmetros.",
        "Condicionais e decisões simples.",
        "Ideal para o primeiro contato com o Wanda.",
      ],
      tags: ["Estruturas condicionais", "Variáveis", "Tipos primitivos"],
      ctaLabel: "Desenvolver função",
      disabled: false,
      onCta: () => navigate("/jokenpo1"),
    }
  ];

  return (
    <div className="games-page">
      <header className="games-header">
        <h1 className="games-title">Jogos</h1>
        <p className="games-subtitle">
          Escolha um jogo para desenvolver sua função e evoluir seu bot.
        </p>
      </header>

      <section className="games-list" aria-label="Lista de jogos disponíveis">
        {games.map((g) => (
          <GameBannerCard key={g.key} {...g} />
        ))}
      </section>
    </div>
  );
}
