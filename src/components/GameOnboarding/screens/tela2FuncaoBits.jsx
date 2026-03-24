import { useState, useEffect, useRef } from "react";
import "./telas.css";
import timmyImage from "../../../assets/timmy.png";

// Cartas do BITS com emoji representativo
const CARTAS_BITS = ["BIT8", "BIT16", "BIT32", "FIREWALL"];
const EMOJI_BITS  = { BIT8: "🟦", BIT16: "🟩", BIT32: "🟥", FIREWALL: "🛡️" };

// Cada jogador começa com 1 de cada carta (simplificado para a demonstração)
function sortearMaos() {
  return {
    jogador:    [...CARTAS_BITS],
    adversario: [...CARTAS_BITS],
  };
}

export default function Tela2FuncaoBits({ onPronto }) {
  const [etapa, setEtapa] = useState(0);
  const [maos, setMaos]   = useState({ jogador: [], adversario: [] });
  const iniciou           = useRef(false);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    const resultado = sortearMaos();
    setMaos(resultado);

    setTimeout(() => setEtapa(1), 800);
    setTimeout(() => setEtapa(2), 2000);
    setTimeout(() => setEtapa(3), 3200);
    setTimeout(() => setEtapa(4), 4400);
  }, []);

  const { jogador, adversario } = maos;

  onPronto();

  return (
    <div className="tela">
      <div className="tela__fala">
        <div className="tela__avatar"><img src={timmyImage} alt="timmy-avatar" /></div>
        <div className="tela__bubble">
          Sou o <strong>Timmy</strong>! No BITS, cada jogador começa com as
          mesmas 4 cartas. Você usa cada uma uma única vez por partida. 🃏
        </div>
      </div>

      {/* Etapa 1+: cartas disponíveis */}
      {etapa >= 1 && (
        <div className="tela2__secao tela2__fade">
          <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
            {etapa === 1 ? "🎲 Preparando as cartas..." : "Suas cartas disponíveis"}
          </p>
          <div className="tela2__maos">
            <div className="tela2__lado">
              <span className="tela2__lado-label">Sua mão</span>
              <div className="tela2__cartas">
                {jogador.map((carta, i) => (
                  <div
                    key={i}
                    className={[
                      "tela2__carta",
                      etapa >= 2 ? "tela2__carta--revelada" : "tela2__carta--virada",
                    ].join(" ")}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {etapa >= 2 ? (
                      <span style={{ fontSize: 22 }}>{EMOJI_BITS[carta]}</span>
                    ) : "🂠"}
                  </div>
                ))}
              </div>
            </div>

            <div className="tela2__vs">VS</div>

            <div className="tela2__lado">
              <span className="tela2__lado-label">Adversário</span>
              <div className="tela2__cartas">
                {adversario.map((_, i) => (
                  <div key={i} className="tela2__carta tela2__carta--virada">
                    {etapa >= 4 ? "🔒" : "🂠"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {etapa >= 2 && (
            <div className="tela2__relacao tela2__fade">
              <span className="tela2__relacao-txt">
                Ambos começam com{" "}
                {jogador.map((c, i) => (
                  <span key={i} className="tela2__relacao-carta">
                    {EMOJI_BITS[c]}
                  </span>
                ))}{" "}
                — mas as cartas do adversário ficam ocultas.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Etapa 3+: assinatura da função */}
      {etapa >= 3 && (
        <div className="tela2__secao tela2__fade">
          <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
            É isso que sua função recebe
          </p>
          <div className="tela2__codigo">
            <span className="tela2__kw">def</span>{" "}
            <span className="tela2__fn">strategy</span>(
            <span className="tela2__param">bit8</span>,{" "}
            <span className="tela2__param">bit16</span>,{" "}
            <span className="tela2__param">bit32</span>,{" "}
            <span className="tela2__param">firewall</span>,{" "}
            <span className="tela2__param">opp_last</span>):
            <br />
            <span className="tela2__indent">
              <span className="tela2__cmt"># bit8, bit16, bit32, firewall = </span>
              <span className="tela2__val">1</span>
              <span className="tela2__cmt"> se ainda tem a carta, </span>
              <span className="tela2__val">0</span>
              <span className="tela2__cmt"> se já usou</span>
            </span>
            <br />
            <span className="tela2__indent">
              <span className="tela2__cmt"># opp_last = última carta jogada pelo adversário (ou </span>
              <span className="tela2__val">None</span>
              <span className="tela2__cmt">)</span>
            </span>
            <br />
            <span className="tela2__indent">
              <span className="tela2__kw">return</span>{" "}
              <span className={etapa >= 4 ? "tela2__return--destaque" : "tela2__str"}>
                ???
              </span>
            </span>
          </div>

          {etapa >= 4 && (
            <div className="tela2__retorno-hint tela2__fade">
              Sua função deve retornar qual carta jogar:{" "}
              <span className="tela2__tag">🟦 "BIT8"</span>
              <span className="tela2__tag">🟩 "BIT16"</span>
              <span className="tela2__tag">🟥 "BIT32"</span>
              <span className="tela2__tag">🛡️ "FIREWALL"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
