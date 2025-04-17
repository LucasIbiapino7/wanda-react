import { useRef, useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
gsap.registerPlugin(TextPlugin);
import ArenaBackground from "../../assets/arena-background-pixel-art.png"
import './Arena.css'
import PropTypes from "prop-types";

const Arena = ({ duelData }) => {
  // Referências para os elementos animáveis
  const arenaRef = useRef();
  const player1CardsRef = useRef([]);
  const player2CardsRef = useRef([]);
  const matchAnnouncementRef = useRef();
  const scoreRefs = useRef({
    player1: useRef(),
    player2: useRef(),
    remaining: useRef(),
  });

  // Inicializa arrays de refs para as cartas
  player1CardsRef.current = [];
  player2CardsRef.current = [];

  // Referências para os personagens
  const characterLeftRef = useRef();
  const characterRightRef = useRef();

  // Ref para o elemento de áudio
  const audioRef = useRef();

  // Timeline principal
  const timelineMain = useRef();

  const createMatchTimeline = (match) => {
    const tlMatch = gsap.timeline();

    // 1. Animação de entrada para anunciar o match
    tlMatch.to(matchAnnouncementRef.current, {
      duration: 0.5,
      opacity: 1,
      text: `Partida ${match.matchNumber} Começando!`,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(matchAnnouncementRef.current, {
          duration: 0.5,
          delay: 1,
          opacity: 0,
        });
      },
    });

    // 2. Atualiza os src das cartas usando a ordem correta do JSON.
    //    Aqui, atualizamos as imagens e (se necessário) podemos limpar as bordas antigas,
    //    embora agora a remoção das bordas seja feita no fim do match.
    tlMatch.call(() => {
      // Atualizando as cartas do Player 1
      player1CardsRef.current.forEach((cardElement, index) => {
        if (match.player1cards && match.player1cards[index]) {
          cardElement.src = `/assets/${match.player1cards[index]}.png`;
        }
      });
      // Atualizando as cartas do Player 2
      player2CardsRef.current.forEach((cardElement, index) => {
        if (match.player2cards && match.player2cards[index]) {
          cardElement.src = `/assets/${match.player2cards[index]}.png`;
        }
      });
    });

    // 3. Para cada round (play) dentro do match, anima as cartas jogadas simultaneamente.
    //    Usamos os índices para selecionar a carta, pois agora a ordem reflete a ordem de jogada.
    match.plays.forEach((play, index) => {
      // Seleciona a carta pela posição (já que a ordem do array corresponde à ordem de jogada)
      const cardPlayer1 = player1CardsRef.current[index];
      const cardPlayer2 = player2CardsRef.current[index];

      if (cardPlayer1 && cardPlayer2) {
        // Movimenta ambas as cartas para o centro simultaneamente.
        // Valores atualizados para 120 e -120
        const movePosition = ">0.2"; // mesmo início para ambos
        tlMatch.to(
          cardPlayer1,
          {
            duration: 0.5,
            x: 175,
            ease: "power1.inOut",
          },
          movePosition
        );
        tlMatch.to(
          cardPlayer2,
          {
            duration: 0.5,
            x: -175,
            ease: "power1.inOut",
          },
          movePosition
        );

        // Após atingirem o centro, aplica o efeito de borda para indicar o resultado.
        tlMatch.call(() => {
          if (play.tie || play.winnerOfPlay === 0) {
            // Empate: borda amarela em ambas
            cardPlayer1.style.border = "4px solid yellow";
            cardPlayer2.style.border = "4px solid yellow";
          } else if (play.winnerOfPlay === 1) {
            // Player 1 venceu: verde para ele, vermelho para o outro.
            cardPlayer1.style.border = "4px solid green";
            cardPlayer2.style.border = "4px solid red";
          } else if (play.winnerOfPlay === 2) {
            // Player 2 venceu: verde para ele, vermelho para o outro.
            cardPlayer1.style.border = "4px solid red";
            cardPlayer2.style.border = "4px solid green";
          }
        });

        // Uma pequena pausa para que o usuário veja as bordas
        tlMatch.to({}, { duration: 0.3 });

        // Em seguida, retorna ambas as cartas à posição original simultaneamente.
        const returnPosition = ">0.1";
        tlMatch.to(
          cardPlayer1,
          {
            duration: 0.5,
            x: 0,
            ease: "power1.inOut",
          },
          returnPosition
        );
        tlMatch.to(
          cardPlayer2,
          {
            duration: 0.5,
            x: 0,
            ease: "power1.inOut",
          },
          returnPosition
        );
      }
    });

    // 4. Agora removemos todas as bordas ao final do match (fora do loop de rounds)
    tlMatch.call(() => {
      player1CardsRef.current.forEach((card) => {
        card.style.border = "none";
      });
      player2CardsRef.current.forEach((card) => {
        card.style.border = "none";
      });
    });

    // 5. Atualiza os placares com os dados do match.
    tlMatch.call(() => {
      if (scoreRefs.current.player1 && scoreRefs.current.player1.current) {
        const el1 = scoreRefs.current.player1.current;
        el1.innerText = `VITORIAS: ${match.currentScore.player1}`;
        gsap.fromTo(
          el1,
          { scale: 1.2 },
          { duration: 0.5, scale: 1, ease: "elastic.out(1, 0.3)" }
        );
      }
      if (scoreRefs.current.player2 && scoreRefs.current.player2.current) {
        const el2 = scoreRefs.current.player2.current;
        el2.innerText = `VITORIAS: ${match.currentScore.player2}`;
        gsap.fromTo(
          el2,
          { scale: 1.2 },
          { duration: 0.5, scale: 1, ease: "elastic.out(1, 0.3)" }
        );
      }
      if (scoreRefs.current.remaining && scoreRefs.current.remaining.current) {
        const elTie = scoreRefs.current.remaining.current;
        elTie.innerText = `EMPATES: ${match.currentScore.tie}`;
        gsap.fromTo(
          elTie,
          { scale: 1.2 },
          { duration: 0.5, scale: 1, ease: "elastic.out(1, 0.3)" }
        );
      }
    });

    // Uma pequena pausa antes do próximo match
    tlMatch.to({}, { duration: 1 });

    return tlMatch;
  };

  // Configuração das animações (timeline principal)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Cria uma timeline principal
      const masterTL = gsap.timeline({ paused: true });

      // Animação inicial para a arena (ex.: fade in)
      masterTL.from(arenaRef.current, {
        opacity: 0,
        y: 100,
        duration: 1,
        immediateRender: false,
      });

      // Para cada match do JSON, adicione a timeline criada
      duelData.matches.forEach((match) => {
        masterTL.add(createMatchTimeline(match));
      });

      // Após todas as partidas, exibe uma animação final para o vencedor e destaca o personagem vencedor
      // Após todas as partidas, exibe uma animação final para o vencedor e aplica efeitos de destaque e dano.
      masterTL.call(() => {
        if (duelData.playerWinner) {
          // Exibe o anúncio do vencedor
          gsap.to(matchAnnouncementRef.current, {
            duration: 1,
            opacity: 1,
            text: `${duelData.playerWinner.name} Venceu!`,
            ease: "bounce.out",
          });

          if (duelData.playerWinner.id === duelData.player1.id) {
            // Destaque no personagem vencedor (Player 1)
            gsap.set(characterLeftRef.current, { clearProps: "animation" });
            gsap.killTweensOf(characterLeftRef.current);
            gsap
              .timeline()
              .to(characterLeftRef.current, {
                duration: 0.5,
                scale: 1.5,
                filter: "drop-shadow(0 0 20px gold)",
                ease: "power2.out",
              })
              .to(characterLeftRef.current, {
                duration: 3, // Mantém o destaque por 3 segundos
                scale: 1.5,
                ease: "none",
              });

            // Aplica efeito de dano (shake + flash) no perdedor (Player 2)
            gsap.set(characterRightRef.current, { clearProps: "animation" });
            gsap.killTweensOf(characterRightRef.current);
            gsap
              .timeline()
              .to(characterRightRef.current, {
                duration: 0.1,
                x: 10,
                ease: "power1.out",
              })
              .to(characterRightRef.current, {
                duration: 0.1,
                x: -10,
                ease: "power1.inOut",
                repeat: 3,
                yoyo: true,
              })
              .to(characterRightRef.current, {
                duration: 0.1,
                x: 0,
                ease: "power1.inOut",
              })
              // Mantém o flash vermelho por 3 segundos
              .to(characterRightRef.current, {
                duration: 3,
                filter: "drop-shadow(0 0 20px red)",
                ease: "none",
              });
          } else {
            // Vencedor é Player 2
            gsap.set(characterRightRef.current, { clearProps: "animation" });
            gsap.killTweensOf(characterRightRef.current);
            gsap
              .timeline()
              .to(characterRightRef.current, {
                duration: 0.5,
                scale: 1.5,
                filter: "drop-shadow(0 0 20px gold)",
                ease: "power2.out",
              })
              .to(characterRightRef.current, {
                duration: 3,
                scale: 1.5,
                ease: "none",
              });

            // Aplica efeito de dano (shake + flash) no perdedor (Player 1)
            gsap.set(characterLeftRef.current, { clearProps: "animation" });
            gsap.killTweensOf(characterLeftRef.current);
            gsap
              .timeline()
              .to(characterLeftRef.current, {
                duration: 0.1,
                x: 10,
                ease: "power1.out",
              })
              .to(characterLeftRef.current, {
                duration: 0.1,
                x: -10,
                ease: "power1.inOut",
                repeat: 3,
                yoyo: true,
              })
              .to(characterLeftRef.current, {
                duration: 0.1,
                x: 0,
                ease: "power1.inOut",
              })
              .to(characterLeftRef.current, {
                duration: 3,
                filter: "drop-shadow(0 0 20px red)",
                ease: "none",
              });
          }
        }
      });

      // Salva a timeline principal para controles se necessário
      timelineMain.current = masterTL;
      masterTL.play();
    }, arenaRef);

    return () => ctx.revert();
  }, [duelData]); // Caso os dados mudem, a timeline se atualiza

  useEffect(() => {
    const handleUnmute = () => {
      if (audioRef.current && audioRef.current.muted) {
        audioRef.current.muted = false;
        audioRef.current.play();
        document.removeEventListener("click", handleUnmute);
      }
    };
    document.addEventListener("click", handleUnmute);
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }
    return () => document.removeEventListener("click", handleUnmute);
  }, []);

  return (
    <div className="arena-container" ref={arenaRef}>
      {/* NOVA: Elemento de áudio para a música de fundo */}
      <audio id="background-music" ref={audioRef} autoPlay loop muted>
        <source src="/assets/music/battle-sound.mp3" type="audio/mpeg" />
      </audio>
      <div
        className="arena"
        style={{ backgroundImage: `url(${ArenaBackground})` }}
      >
        {/* Anúncio de partida */}
        <div className="match-announcement" ref={matchAnnouncementRef}></div>

        {/* Informações dos players */}
        <div className="player-info left">
          <h2 className="player-name">{duelData.player1.name}</h2>
          <span className="turns-won" ref={scoreRefs.current.player1}>
            VITORIAS: 0
          </span>
        </div>

        <div className="player-info right">
          <h2 className="player-name">{duelData.player2.name}</h2>
          <span className="turns-won" ref={scoreRefs.current.player2}>
            VITORIAS: 0
          </span>
        </div>

        {/* Personagens */}
        <img
          src={`/assets/personagens/${duelData.player1.character_url}`}
          alt="Jogador 1"
          className="character left"
          ref={characterLeftRef}
        />
        <img
          src={`/assets/personagens/${duelData.player2.character_url}`}
          alt="Jogador 2"
          className="character right"
          ref={characterRightRef}
        />

        {/* Cartas do Jogador 1 */}
        <div className="cards left-cards">
          {[1, 2, 3].map((card, index) => (
            <img
              key={`left-${card}`}
              // Definindo um src default; logo após, a timeline o atualizará
              src="/pedra.png"
              alt="Carta do Jogador 1"
              className="card"
              ref={(el) => (player1CardsRef.current[index] = el)}
            />
          ))}
        </div>

        {/* Cartas do Jogador 2 */}
        <div className="cards right-cards">
          {[1, 2, 3].map((card, index) => (
            <img
              key={`right-${card}`}
              src="/pedra.png"
              alt="Carta do Jogador 2"
              className="card"
              ref={(el) => (player2CardsRef.current[index] = el)}
            />
          ))}
        </div>

        {/* Indicador de Empates */}
        <div className="tie-indicator">
          <span className="counter" ref={scoreRefs.current.remaining}>
            EMPATES: 0
          </span>
        </div>

        {/* Controles temporários para testes */}
        <div className="test-controls">
          {/* Botão para pausar/retomar */}
          <button
            onClick={() => {
              if (timelineMain.current.paused()) {
                timelineMain.current.play();
              } else {
                timelineMain.current.pause();
              }
            }}
          >
            {timelineMain.current && timelineMain.current.paused()
              ? "Retomar"
              : "Pausar"}
          </button>

          {/* Botão para acelerar a velocidade */}
          <button
            onClick={() => {
              const currentScale = timelineMain.current.timeScale();
              timelineMain.current.timeScale(currentScale === 1 ? 3.5 : 1);
            }}
          >
            Acelerar
          </button>

          {/* Botão para ir direto pro final da partida */}
          <button
            onClick={() => {
              // Define a progressão da timeline principal para 1 (fim)
              timelineMain.current.progress(1);
            }}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

Arena.propTypes = {
  duelData: PropTypes.shape({
    player1: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      character_url: PropTypes.string.isRequired,
    }).isRequired,
    player2: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      character_url: PropTypes.string,
    }).isRequired,
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        matchNumber: PropTypes.number.isRequired,
        player1cards: PropTypes.arrayOf(PropTypes.string).isRequired,
        player2cards: PropTypes.arrayOf(PropTypes.string).isRequired,
        plays: PropTypes.arrayOf(
          PropTypes.shape({
            roundNumber: PropTypes.number.isRequired,
            playerCard1: PropTypes.string.isRequired,
            playerCard2: PropTypes.string.isRequired,
            winnerOfPlay: PropTypes.number.isRequired,
            tie: PropTypes.bool.isRequired,
          })
        ).isRequired,
        tie: PropTypes.number.isRequired,
        player1Winners: PropTypes.number.isRequired,
        player2Winners: PropTypes.number.isRequired,
        playerWinTurn: PropTypes.number.isRequired,
        currentScore: PropTypes.shape({
          player1: PropTypes.number.isRequired,
          player2: PropTypes.number.isRequired,
          tie: PropTypes.number.isRequired,
        }).isRequired,
      })
    ).isRequired,
    playerWinner: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      character_url: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Arena;
