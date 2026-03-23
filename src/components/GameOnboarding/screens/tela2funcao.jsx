import { useState, useEffect, useRef } from "react";
import "./telas.css";
import timmyImage from "../../../assets/timmy.png"

const EMOJI = { pedra: "🪨", papel: "📄", tesoura: "✂️" };

function sortearMaos() {
  const baralho = ["pedra", "pedra", "papel", "papel", "tesoura", "tesoura"];
  for (let i = baralho.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
  }
  return {
    jogador: baralho.slice(0, 3),
    adversario: baralho.slice(3, 6),
  };
}

export default function Tela2Funcao({ onPronto }) {
  const [etapa, setEtapa] = useState(0);
  const [maos, setMaos] = useState({ jogador: [], adversario: [] });
  const iniciou = useRef(false);

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
        <div className="tela__avatar"><img src={timmyImage} alt="timmy-avatar"/></div>
        <div className="tela__bubble">
          Sou o <strong>Timmy</strong>! O baralho tem 2 pedras, 2 papéis e 2
          tesouras — embaralhados e divididos entre vocês dois. 🃏
        </div>
      </div>

      {/* Etapa 1+: sorteio das mãos */}
      {etapa >= 1 && (
        <div className="tela2__secao tela2__fade">
          <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
            {etapa === 1 ? "🎲 Sorteando as mãos..." : "Mãos sorteadas!"}
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
                      etapa >= 2
                        ? "tela2__carta--revelada"
                        : "tela2__carta--virada",
                    ].join(" ")}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {etapa >= 2 ? EMOJI[carta] : "🂠"}
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

          {/* Relação entre as mãos */}
          {etapa >= 2 && jogador.length === 3 && adversario.length === 3 && (
            <div className="tela2__relacao tela2__fade">
              <span className="tela2__relacao-txt">
                Você tirou{" "}
                {jogador.map((c, i) => (
                  <span key={i} className="tela2__relacao-carta">
                    {EMOJI[c]}
                  </span>
                ))}{" "}
                então o adversário ficou com{" "}
                {adversario.map((c, i) => (
                  <span
                    key={i}
                    className="tela2__relacao-carta tela2__relacao-carta--oculta"
                  >
                    {EMOJI[c]}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}

      {etapa >= 3 && jogador.length === 3 && (
        <div className="tela2__secao tela2__fade">
          <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
            É isso que sua função recebe
          </p>
          <div className="tela2__codigo">
            <span className="tela2__kw">def</span>{" "}
            <span className="tela2__fn">strategy</span>(
            <span className="tela2__param">card1</span>,{" "}
            <span className="tela2__param">card2</span>,{" "}
            <span className="tela2__param">card3</span>):
            <br />
            <span className="tela2__indent">
              <span className="tela2__cmt"># card1 = </span>
              <span className="tela2__val">"{jogador[0]}"</span>
              {"  "}
              <span>{EMOJI[jogador[0]]}</span>
            </span>
            <br />
            <span className="tela2__indent">
              <span className="tela2__cmt"># card2 = </span>
              <span className="tela2__val">"{jogador[1]}"</span>
              {"  "}
              <span>{EMOJI[jogador[1]]}</span>
            </span>
            <br />
            <span className="tela2__indent">
              <span className="tela2__cmt"># card3 = </span>
              <span className="tela2__val">"{jogador[2]}"</span>
              {"  "}
              <span>{EMOJI[jogador[2]]}</span>
            </span>
            <br />
            <span className="tela2__indent">
              <span className="tela2__kw">return</span>{" "}
              <span
                className={
                  etapa >= 4 ? "tela2__return--destaque" : "tela2__str"
                }
              >
                ???
              </span>
            </span>
          </div>

          {etapa >= 4 && (
            <div className="tela2__retorno-hint tela2__fade">
              Sua função deve retornar qual carta jogar:{" "}
              <span className="tela2__tag">🪨 "pedra"</span>
              <span className="tela2__tag">📄 "papel"</span>
              <span className="tela2__tag">✂️ "tesoura"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
