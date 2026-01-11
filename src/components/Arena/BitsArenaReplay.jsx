import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
gsap.registerPlugin(TextPlugin);

import "./arena.css";
import PropTypes from "prop-types";
import arenaBitsBg from "../../assets/arena-bits-background.png";

const CHARACTER_BASE_PATH = "/assets/personagens/";
const CARD_IMAGES = {
  BIT8: "/assets/bits/bit8.png",
  BIT16: "/assets/bits/bit16.png",
  BIT32: "/assets/bits/bit32.png",
  FIREWALL: "/assets/bits/firewall.png",
};

function getCardImage(cardName) {
  return CARD_IMAGES[cardName] || CARD_IMAGES.BIT8;
}

// deixa o decidedBy mais legível (usaremos no painel / linha do tempo)
function formatDecisionReason(decidedBy) {
  if (!decidedBy) return "";

  const map = {
    TIE_BREAK_LAST_NON_TIE_ROUND:
      "desempate pela última rodada não empatada",
    // futuros critérios podem entrar aqui
  };

  return map[decidedBy] || decidedBy.replaceAll("_", " ").toLowerCase();
}

// gera uma frase curta sobre os erros do bot
function buildErrorMessage(botName, stats) {
  const { invalid, fallbacks } = stats;

  if (invalid === 0 && fallbacks === 0) {
    return `${botName} não apresentou erros de retorno nem precisou de fallbacks. Excelente nível de controle da lógica.`;
  }

  if (invalid === 0 && fallbacks > 0) {
    return `${botName} não enviou retornos inválidos, mas o jogo precisou acionar fallbacks em algumas rodadas. Talvez o bot esteja reaproveitando cartas já usadas.`;
  }

  if (invalid > 0 && fallbacks === 0) {
    return `${botName} gerou retornos inválidos, mas quase não acionou fallbacks. Vale revisar as condições de escolha de cartas.`;
  }

  // invalid > 0 && fallbacks > 0
  return `${botName} gerou retornos inválidos e acionou vários fallbacks. É um bom sinal de que a lógica pode ser simplificada ou melhor validada.`;
}

// descreve o retorno de uma rodada (para a timeline)
function describeReturn(returnObj) {
  if (!returnObj) return "Não retornou nenhuma carta.";

  const raw = returnObj.raw ?? "—";
  const invalid = !!returnObj.invalidReturn;
  const fallbackTo = returnObj.fallbackTo || null;

  if (!raw && !fallbackTo) {
    return "Não retornou nenhuma carta.";
  }

  // monta frase
  if (invalid && fallbackTo) {
    return `${raw} (inválida) → usando ${fallbackTo}`;
  }
  if (invalid && !fallbackTo) {
    return `${raw} (inválida)`;
  }
  if (!invalid && fallbackTo) {
    return `${raw} (trocada por ${fallbackTo})`;
  }
  return `${raw} (válida)`;
}

const BitsArena = ({ duel }) => {
  const duelData = duel;

  const p1Name = duelData.player1.nickname || duelData.player1.name;
  const p2Name = duelData.player2.nickname || duelData.player2.name;

  const totalMatches = duelData.matches?.length ?? 0;
  const lastMatch =
    totalMatches > 0 ? duelData.matches[totalMatches - 1] : null;

  const lastCumulative = lastMatch?.cumulativeScore || {
    player1: 0,
    player2: 0,
    ties: 0,
  };

  // ---- vencedor do duelo (para o painel geral) ----
  let duelWinnerObj = duelData.duelWInner || null;
  if (!duelWinnerObj && lastCumulative) {
    if (lastCumulative.player1 > lastCumulative.player2) {
      duelWinnerObj = duelData.player1;
    } else if (lastCumulative.player2 > lastCumulative.player1) {
      duelWinnerObj = duelData.player2;
    } else {
      duelWinnerObj = null;
    }
  }

  const duelWinnerName = duelWinnerObj
    ? duelWinnerObj.nickname || duelWinnerObj.name
    : null;

  // ---- estatísticas de erros dos bots (duelo inteiro) ----
  const errorStats = duelData.matches.reduce(
    (acc, match) => {
      (match.plays || []).forEach((play) => {
        const p1 = play.returns?.p1;
        const p2 = play.returns?.p2;

        if (p1) {
          if (p1.invalidReturn) acc.p1.invalid += 1;
          if (p1.fallbackTo) acc.p1.fallbacks += 1;
        }
        if (p2) {
          if (p2.invalidReturn) acc.p2.invalid += 1;
          if (p2.fallbackTo) acc.p2.fallbacks += 1;
        }
      });
      return acc;
    },
    {
      p1: { invalid: 0, fallbacks: 0 },
      p2: { invalid: 0, fallbacks: 0 },
    }
  );

  const p1ErrorMsg = buildErrorMessage(p1Name, errorStats.p1);
  const p2ErrorMsg = buildErrorMessage(p2Name, errorStats.p2);

  // ---- linha do tempo: match selecionado ----
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);

  useEffect(() => {
    // se mudar o número de matches, garante índice válido
    if (selectedMatchIndex >= totalMatches) {
      setSelectedMatchIndex(Math.max(0, totalMatches - 1));
    }
  }, [totalMatches, selectedMatchIndex]);

  const selectedMatch =
    totalMatches > 0 ? duelData.matches[selectedMatchIndex] : null;

  const selectedSummary = selectedMatch?.summary || {
    p1Wins: 0,
    p2Wins: 0,
    ties: 0,
    winnerOfMatch: 0,
  };

  let matchWinnerLabel = "Empate";
  if (selectedSummary.winnerOfMatch === 1) {
    matchWinnerLabel = `${p1Name} venceu`;
  } else if (selectedSummary.winnerOfMatch === 2) {
    matchWinnerLabel = `${p2Name} venceu`;
  }

  const matchDecisionReason = selectedMatch?.decision?.decidedBy
    ? formatDecisionReason(selectedMatch.decision.decidedBy)
    : "";

  const matchPlays = selectedMatch?.plays || [];

  // ---- refs / gsap para o replay ----
  const arenaRef = useRef(null);
  const player1CardsRef = useRef([]);
  const player2CardsRef = useRef([]);
  const matchAnnouncementRef = useRef(null);
  const victoryAnnouncementRef = useRef(null);

  const scoreRefs = useRef({
    player1: useRef(),
    player2: useRef(),
    status: useRef(),
  });

  const characterLeftRef = useRef(null);
  const characterRightRef = useRef(null);

  const timelineMain = useRef(null);

  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(4.5);

  // sempre que renderiza, zera os arrays de refs de cartas
  player1CardsRef.current = [];
  player2CardsRef.current = [];

  // Cria timeline de UM match
  const createMatchTimeline = (match, indexMatch, totalMatchesInTimeline) => {
    const tlMatch = gsap.timeline();

    const matchNumber = match.numberMatch ?? indexMatch + 1;
    const p1Deck = match.player1Plays || [];
    const p2Deck = match.player2Plays || [];
    const cumulativeScore = match.cumulativeScore || {
      player1: 0,
      player2: 0,
      ties: 0,
    };

    // 1) anúncio do match
    tlMatch.to(matchAnnouncementRef.current, {
      duration: 0.5,
      opacity: 1,
      text: `MATCH ${matchNumber} / ${totalMatchesInTimeline}`,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(matchAnnouncementRef.current, {
          duration: 0.5,
          delay: 1,
          opacity: 0,
        });
      },
    });

    // 2) configura o deck lateral
    tlMatch.call(() => {
      player1CardsRef.current.forEach((cardElement, index) => {
        if (!cardElement) return;
        const cardName = p1Deck[index];
        if (cardName) cardElement.src = getCardImage(cardName);
      });

      player2CardsRef.current.forEach((cardElement, index) => {
        if (!cardElement) return;
        const cardName = p2Deck[index];
        if (cardName) cardElement.src = getCardImage(cardName);
      });
    });

    // 3) plays
    const plays = match.plays || [];
    plays.forEach((play, index) => {
      const cardElementP1 = player1CardsRef.current[index];
      const cardElementP2 = player2CardsRef.current[index];

      if (!cardElementP1 || !cardElementP2) return;

      const winnerOfPlay = play?.resolved?.winnerOfPlay ?? 0;
      const isTie = play?.resolved?.tie ?? false;

      // atualiza texto central MATCH / PLAY
      tlMatch.call(() => {
        const statusEl = scoreRefs.current.status?.current;
        if (!statusEl) return;

        const text = `MATCH: ${matchNumber} / ${totalMatchesInTimeline} · PLAY: ${
          index + 1
        } / ${plays.length}`;

        if (statusEl.innerText !== text) {
          statusEl.innerText = text;
          gsap.fromTo(
            statusEl,
            { scale: 1.1 },
            { scale: 1, duration: 0.3, ease: "elastic.out(1,0.5)" }
          );
        }
      });

      const movePosition = ">0.2";

      // move cartas para o centro
      tlMatch.to(
        cardElementP1,
        { duration: 0.5, x: 175, ease: "power1.inOut" },
        movePosition
      );
      tlMatch.to(
        cardElementP2,
        { duration: 0.5, x: -175, ease: "power1.inOut" },
        movePosition
      );

      // muda cor da borda conforme resultado
      tlMatch.call(() => {
        if (isTie || winnerOfPlay === 0) {
          cardElementP1.style.border = "4px solid yellow";
          cardElementP2.style.border = "4px solid yellow";
        } else if (winnerOfPlay === 1) {
          cardElementP1.style.border = "4px solid #00ff00";
          cardElementP2.style.border = "4px solid #ff0000";
        } else if (winnerOfPlay === 2) {
          cardElementP1.style.border = "4px solid #ff0000";
          cardElementP2.style.border = "4px solid #00ff00";
        }
      });

      // pausa
      tlMatch.to({}, { duration: 0.3 });

      // volta cartas
      const returnPosition = ">0.1";
      tlMatch.to(
        cardElementP1,
        { duration: 0.5, x: 0, ease: "power1.inOut" },
        returnPosition
      );
      tlMatch.to(
        cardElementP2,
        { duration: 0.5, x: 0, ease: "power1.inOut" },
        returnPosition
      );
    });

    // 4) limpa bordas
    tlMatch.call(() => {
      player1CardsRef.current.forEach((c) => {
        if (c) c.style.border = "2px solid #fff";
      });
      player2CardsRef.current.forEach((c) => {
        if (c) c.style.border = "2px solid #fff";
      });
    });

    // 5) atualiza placar acumulado na parte de cima
    tlMatch.call(() => {
      const p1El = scoreRefs.current.player1?.current;
      const p2El = scoreRefs.current.player2?.current;

      const bumpIfChanged = (el, newText, charRef) => {
        if (!el) return;
        if (el.innerText !== newText) {
          el.innerText = newText;

          gsap.fromTo(
            el,
            { backgroundColor: "#ffb84d", color: "#2b2b44" },
            { backgroundColor: "transparent", color: "#00ff00", duration: 0.4 }
          );

          if (charRef?.current) {
            const tlChar = gsap.timeline();
            tlChar
              .to(charRef.current, {
                x: -20,
                duration: 0.08,
                ease: "power1.inOut",
                yoyo: true,
                repeat: 8,
              })
              .to(
                charRef.current,
                {
                  scale: 1.3,
                  filter: "drop-shadow(0 0 30px gold)",
                  duration: 0.3,
                  yoyo: true,
                  repeat: 1,
                },
                "<"
              )
              .to(charRef.current, {
                scale: 1,
                filter: "none",
                duration: 0.2,
              });
          }
        }
      };

      bumpIfChanged(
        p1El,
        `VITÓRIAS: ${cumulativeScore.player1 ?? 0}`,
        characterLeftRef
      );
      bumpIfChanged(
        p2El,
        `VITÓRIAS: ${cumulativeScore.player2 ?? 0}`,
        characterRightRef
      );
    });

    tlMatch.to({}, { duration: 0.7 });

    return tlMatch;
  };

  // Monta timeline principal do replay
  useLayoutEffect(() => {
    if (!duelData || !duelData.matches) return;

    const ctx = gsap.context(() => {
      const masterTL = gsap.timeline({ paused: true });
      const totalMatchesInTimeline = duelData.matches.length;

      masterTL.from(arenaRef.current, {
        opacity: 0,
        y: 100,
        duration: 1,
        immediateRender: false,
      });

      duelData.matches.forEach((match, index) => {
        masterTL.add(
          createMatchTimeline(match, index, totalMatchesInTimeline)
        );
      });

      // vencedor do duelo (animação final)
      masterTL.call(() => {
        let winner = duelData.duelWInner;

        if (!winner && duelData.matches.length > 0) {
          const last = duelData.matches[duelData.matches.length - 1] || {};
          const cs = last.cumulativeScore || {};
          if (cs.player1 > cs.player2) winner = duelData.player1;
          else if (cs.player2 > cs.player1) winner = duelData.player2;
        }

        if (!winner) return;

        const winnerIsP1 = winner.id === duelData.player1.id;

        gsap.to(victoryAnnouncementRef.current, {
          duration: 1,
          opacity: 1,
          text: `${winner.nickname || winner.name} venceu o duelo!`,
          ease: "bounce.out",
        });

        const winnerRef = winnerIsP1 ? characterLeftRef : characterRightRef;
        const loserRef = winnerIsP1 ? characterRightRef : characterLeftRef;

        if (winnerRef.current) {
          gsap.set(winnerRef.current, { clearProps: "animation" });
          gsap.killTweensOf(winnerRef.current);
          gsap
            .timeline()
            .to(winnerRef.current, {
              duration: 0.5,
              scale: 1.5,
              filter: "drop-shadow(0 0 20px gold)",
              ease: "power2.out",
            })
            .to(winnerRef.current, {
              duration: 3,
              scale: 1.5,
              ease: "none",
            });
        }

        if (loserRef.current) {
          gsap.set(loserRef.current, { clearProps: "animation" });
          gsap.killTweensOf(loserRef.current);
          gsap
            .timeline()
            .to(loserRef.current, {
              duration: 0.1,
              x: 10,
              ease: "power1.out",
            })
            .to(loserRef.current, {
              duration: 0.1,
              x: -10,
              ease: "power1.inOut",
              repeat: 3,
              yoyo: true,
            })
            .to(loserRef.current, {
              duration: 0.1,
              x: 0,
              ease: "power1.inOut",
            })
            .to(loserRef.current, {
              duration: 3,
              filter: "drop-shadow(0 0 20px red)",
              ease: "none",
            });
        }
      });

      timelineMain.current = masterTL;
      masterTL.timeScale(speed);
      masterTL.play();
    }, arenaRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelData]);

  const togglePlayPause = () => {
    const tl = timelineMain.current;
    if (!tl) return;
    if (tl.paused()) {
      tl.play();
      setPaused(false);
    } else {
      tl.pause();
      setPaused(true);
    }
  };

  const toggleSpeed = () => {
    const tl = timelineMain.current;
    if (!tl) return;
    const next = speed === 4.5 ? 2 : 4.5;
    tl.timeScale(next);
    setSpeed(next);
  };

  const skipToEnd = () => {
    const tl = timelineMain.current;
    if (!tl) return;
    tl.progress(1);
  };

  return (
    <div className="bits-arena-page">
      <div className="arena-container">
        <div
          className="arena"
          style={{ backgroundImage: `url(${arenaBitsBg})` }}
          ref={arenaRef}
        >
          <div
            className="match-announcement"
            ref={matchAnnouncementRef}
          ></div>

          <div
            className="victory-announcement"
            ref={victoryAnnouncementRef}
          ></div>

          {/* Info dos players / placar acumulado */}
          <div className="player-info left">
            <h2 className="player-name">{p1Name}</h2>
            <span className="turns-won" ref={scoreRefs.current.player1}>
              VITÓRIAS: 0
            </span>
          </div>

          <div className="player-info right">
            <h2 className="player-name">{p2Name}</h2>
            <span className="turns-won" ref={scoreRefs.current.player2}>
              VITÓRIAS: 0
            </span>
          </div>

          {/* Personagens */}
          <img
            src={`${CHARACTER_BASE_PATH}${duelData.player1.character_url}`}
            alt="Jogador 1"
            className="character left"
            ref={characterLeftRef}
          />
          <img
            src={`${CHARACTER_BASE_PATH}${duelData.player2.character_url}`}
            alt="Jogador 2"
            className="character right"
            ref={characterRightRef}
          />

          {/* Deck lateral P1 */}
          <div className="cards left-cards">
            {[0, 1, 2, 3].map((idx) => (
              <img
                key={`left-${idx}`}
                src={getCardImage("BIT8")}
                alt="Carta P1"
                className="card"
                ref={(el) => (player1CardsRef.current[idx] = el)}
              />
            ))}
          </div>

          {/* Deck lateral P2 */}
          <div className="cards right-cards">
            {[0, 1, 2, 3].map((idx) => (
              <img
                key={`right-${idx}`}
                src={getCardImage("BIT16")}
                alt="Carta P2"
                className="card"
                ref={(el) => (player2CardsRef.current[idx] = el)}
              />
            ))}
          </div>

          {/* Status MATCH / PLAY no topo central */}
          <div className="tie-indicator">
            <span className="counter" ref={scoreRefs.current.status}>
              MATCH: - / - · PLAY: - / -
            </span>
          </div>

          {/* Controles */}
          <div className="test-controls">
            <button className="control-btn" onClick={togglePlayPause}>
              {paused ? "Retomar" : "Pausar"}
            </button>
            <button className="control-btn" onClick={toggleSpeed}>
              {speed === 4.5 ? "Normal" : "Acelerar"}
            </button>
            <button className="control-btn" onClick={skipToEnd}>
              Finalizar
            </button>
          </div>

          {/* Hint de scroll para o painel */}
          <div className="scroll-hint">
            <span>Role para ver o painel de análise ↓</span>
          </div>
        </div>

        {/* PAINEL DE ANÁLISE */}
        <section className="analysis-panel">
          <h3 className="analysis-title">Painel de análise</h3>

          {/* Como interpretar */}
          <div className="analysis-section">
            <h4 className="analysis-subtitle">
              Como interpretar este painel?
            </h4>
            <ul className="analysis-list">
              <li>
                <strong>Retorno inválido:</strong> quando o seu bot devolve
                uma carta que não é permitida pelo jogo.
              </li>
              <li>
                <strong>Fallback:</strong> quando o jogo precisa trocar a carta
                retornada por outra (por exemplo, porque aquela já foi usada).
              </li>
              <li>
                Menos erros → bot mais estável e mais fácil de entender.
              </li>
            </ul>
          </div>

          {/* Resultado do duelo + chips */}
          <div className="analysis-grid">
            <div className="analysis-main">
              <p className="analysis-label">Resultado do duelo</p>
              <p className="analysis-result">
                {duelWinnerName
                  ? `${duelWinnerName} venceu o duelo`
                  : "Duelo empatado"}
              </p>
            </div>

            <div className="analysis-side">
              <div className="analysis-chip">
                <span className="chip-label">Placar final</span>
                <span className="chip-value">
                  {p1Name} {lastCumulative.player1 ?? 0} ×{" "}
                  {lastCumulative.player2 ?? 0} {p2Name}
                </span>
              </div>

              <div className="analysis-chip">
                <span className="chip-label">Partidas jogadas</span>
                <span className="chip-value">{totalMatches}</span>
              </div>
            </div>
          </div>

          {/* Erros dos bots */}
          <div className="bots-errors">
            <h4 className="analysis-subtitle">Erros dos bots</h4>

            <div className="bots-errors-grid">
              <div className="bot-card">
                <h5 className="bot-name">{p1Name}</h5>
                <p className="bot-metric">
                  Retornos inválidos:{" "}
                  <span className="metric-value">
                    {errorStats.p1.invalid}
                  </span>
                </p>
                <p className="bot-metric">
                  Fallbacks acionados:{" "}
                  <span className="metric-value">
                    {errorStats.p1.fallbacks}
                  </span>
                </p>
                <p className="bot-note">{p1ErrorMsg}</p>
              </div>

              <div className="bot-card">
                <h5 className="bot-name">{p2Name}</h5>
                <p className="bot-metric">
                  Retornos inválidos:{" "}
                  <span className="metric-value">
                    {errorStats.p2.invalid}
                  </span>
                </p>
                <p className="bot-metric">
                  Fallbacks acionados:{" "}
                  <span className="metric-value">
                    {errorStats.p2.fallbacks}
                  </span>
                </p>
                <p className="bot-note">{p2ErrorMsg}</p>
              </div>
            </div>
          </div>

          {/* Linha do tempo das partidas */}
          <div className="timeline-section">
            <h4 className="analysis-subtitle">
              Linha do tempo das partidas
            </h4>

            {totalMatches === 0 ? (
              <p className="timeline-empty">
                Não há dados de partidas para exibir.
              </p>
            ) : (
              <>
                {/* seletor de match */}
                <div className="timeline-match-selector">
                  {duelData.matches.map((match, idx) => (
                    <button
                      key={match.numberMatch ?? idx}
                      className={
                        "timeline-chip" +
                        (idx === selectedMatchIndex ? " active" : "")
                      }
                      onClick={() => setSelectedMatchIndex(idx)}
                    >
                      Partida {match.numberMatch ?? idx + 1}
                    </button>
                  ))}
                </div>

                {/* resumo do match selecionado */}
                <div className="timeline-match-summary">
                  <p className="timeline-match-title">
                    Partida {selectedMatch?.numberMatch ?? selectedMatchIndex + 1}{" "}
                    – {matchWinnerLabel}
                  </p>
                  <p className="timeline-match-details">
                    Vitórias de {p1Name}: {selectedSummary.p1Wins} · Vitórias
                    de {p2Name}: {selectedSummary.p2Wins} · Empates:{" "}
                    {selectedSummary.ties}
                  </p>

                  {matchDecisionReason && (
                    <p className="timeline-match-details">
                      Critério de desempate:{" "}
                      <span className="analysis-highlight">
                        {matchDecisionReason}
                      </span>
                    </p>
                  )}
                </div>

                {/* lista de plays */}
                <ul className="timeline-list">
                  {matchPlays.map((play, idx) => {
                    const roundNumber = play.roundNumber ?? idx + 1;
                    const p1 = play.returns?.p1;
                    const p2 = play.returns?.p2;
                    const resolved = play.resolved || {};
                    const winnerOfPlay = resolved.winnerOfPlay ?? 0;
                    const isTie = resolved.tie ?? false;

                    let resultText = "Empate";
                    if (!isTie && winnerOfPlay === 1) {
                      resultText = `${p1Name} venceu a rodada`;
                    } else if (!isTie && winnerOfPlay === 2) {
                      resultText = `${p2Name} venceu a rodada`;
                    }

                    return (
                      <li key={roundNumber} className="timeline-item">
                        <div className="timeline-badge">
                          R{roundNumber}
                        </div>
                        <div className="timeline-content">
                          <p className="timeline-round-label">
                            Rodada {roundNumber}
                          </p>
                          <p>
                            <strong>{p1Name}:</strong>{" "}
                            {describeReturn(p1)}
                          </p>
                          <p>
                            <strong>{p2Name}:</strong>{" "}
                            {describeReturn(p2)}
                          </p>
                          <p className="timeline-result">
                            Resultado: {resultText}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

BitsArena.propTypes = {
  duel: PropTypes.shape({
    player1: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      nickname: PropTypes.string,
      character_url: PropTypes.string.isRequired,
    }).isRequired,
    player2: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      nickname: PropTypes.string,
      character_url: PropTypes.string.isRequired,
    }).isRequired,
    duelWInner: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      nickname: PropTypes.string,
      character_url: PropTypes.string,
    }),
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        numberMatch: PropTypes.number,
        plays: PropTypes.arrayOf(
          PropTypes.shape({
            roundNumber: PropTypes.number,
            returns: PropTypes.object,
            resolved: PropTypes.shape({
              card1: PropTypes.string,
              card2: PropTypes.string,
              winnerOfPlay: PropTypes.number,
              tie: PropTypes.bool,
              reason: PropTypes.string,
            }),
          })
        ),
        player1Plays: PropTypes.arrayOf(PropTypes.string),
        player2Plays: PropTypes.arrayOf(PropTypes.string),
        summary: PropTypes.shape({
          p1Wins: PropTypes.number,
          p2Wins: PropTypes.number,
          ties: PropTypes.number,
          winnerOfMatch: PropTypes.number,
        }),
        cumulativeScore: PropTypes.shape({
          player1: PropTypes.number,
          player2: PropTypes.number,
          ties: PropTypes.number,
        }),
        decision: PropTypes.shape({
          officialWinner: PropTypes.number,
          decidedBy: PropTypes.string,
        }),
      })
    ).isRequired,
  }).isRequired,
};

export default BitsArena;
