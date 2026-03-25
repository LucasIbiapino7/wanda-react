import { useState } from "react";
import "./telas.css";
import cosmoImage from "../../../assets/cosmo-avatar.png";
import CardBit8 from "../../../assets/bits/bit8.png"
import CardBit16 from "../../../assets/bits/bit16.png"
import CardBit32 from "../../../assets/bits/bit32.png"
import CardFirewall from "../../../assets/bits/firewall.png"
import CardSecret from "../../../assets/secret.png"

const CARTAS = [
  { key: "BIT8",     label: "BIT8",     image: CardBit8 },
  { key: "BIT16",    label: "BIT16",    image: CardBit16 },
  { key: "BIT32",    label: "BIT32",    image: CardBit32 },
  { key: "FIREWALL", label: "FIREWALL", image: CardFirewall },
];

const VENCE = {
  BIT8:     ["None"],
  BIT16:    ["BIT8"],
  BIT32:    ["BIT16", "BIT8"],
  FIREWALL: ["BIT32","BIT16", "BIT8"],
};

function resultado(eu, opp) {
  if (eu === opp) return "empate";
  if (VENCE[eu].includes(opp)) {
    return "vitoria"
  }
  return "derrota"
}

const PLACAR_LABEL = {
  vitoria: "Você ganhou! 🎉",
  derrota: "Adversário ganhou! 😤",
  empate:  "Empate! 🤝",
};
const PLACAR_CLASSE = {
  vitoria: "tela1__badge--win",
  derrota: "tela1__badge--lose",
  empate:  "tela1__badge--draw",
};

export default function Tela1JogoBits({ onPronto }) {
  const [rounds, setRounds]       = useState([]);
  const [esperando, setEsperando] = useState(true);

  const pontos = (tipo) => rounds.filter((r) => r.res === tipo).length;

  const jogar = (carta) => {
    if (!esperando || rounds.length >= 3) return;

    const oppIndex = Math.floor(Math.random() * CARTAS.length);
    const opp      = CARTAS[oppIndex].key;
    const res      = resultado(carta, opp);

    setRounds((prev) => {
      const novos = [...prev, { eu: carta, opp, res }];
      if (novos.length === 3) {
        setTimeout(() => onPronto(), 1200);
      } else {
        setTimeout(() => setEsperando(true), 1200);
      }
      return novos;
    });

    setEsperando(false);
  };

  const emojiDe = (key) => CARTAS.find((c) => c.key === key)?.image ?? CardSecret;
  const ultimo   = rounds[rounds.length - 1];
  const fimDeJogo = rounds.length === 3;

  return (
    <div className="tela">
      <div className="tela__fala">
        <div className="tela__avatar"><img src={cosmoImage} alt="cosmo-avatar" /></div>
        <div className="tela__bubble">
          Sou o <strong>Cosmo</strong>! Vamos jogar um round rápido de BITS.
          Cada jogador tem um conjunto de cartas — escolha a sua! 🃏
        </div>
      </div>

      <div className="tela1__placar">
        <div className="tela1__placar-lado">
          <span className="tela1__placar-nome">Você</span>
          <span className="tela1__placar-pts">{pontos("vitoria")}</span>
        </div>
        <div className="tela1__placar-rounds">
          {Array.from({ length: 3 }).map((_, i) => {
            const r = rounds[i];
            return (
              <div
                key={i}
                className={[
                  "tela1__placar-bolinha",
                  r
                    ? r.res === "vitoria"
                      ? "tela1__placar-bolinha--win"
                      : r.res === "derrota"
                        ? "tela1__placar-bolinha--lose"
                        : "tela1__placar-bolinha--draw"
                    : "",
                ].join(" ")}
              />
            );
          })}
        </div>
        <div className="tela1__placar-lado tela1__placar-lado--dir">
          <span className="tela1__placar-pts">{pontos("derrota")}</span>
          <span className="tela1__placar-nome">Adversário</span>
        </div>
      </div>

      {/* Arena */}
      <div className="tela1__arena">
        <div className="tela1__slot">
          <span className="tela1__slot-label">Você</span>
          <div className="tela1__carta tela1__carta--grande">
            <img src={ultimo ? emojiDe(ultimo.eu) : CardSecret}/>
            {ultimo && <span className="tela1__carta-label">{ultimo.eu}</span>}
          </div>
        </div>
        <span className="tela1__vs">VS</span>
        <div className="tela1__slot">
          <span className="tela1__slot-label">Adversário</span>
          <div className="tela1__carta tela1__carta--grande">
            <img src={ultimo ? emojiDe(ultimo.opp) : CardSecret}/>
            {ultimo && <span className="tela1__carta-label">{ultimo.opp}</span>}
          </div>
        </div>
      </div>

      {ultimo && (
        <div className={`tela1__badge ${PLACAR_CLASSE[ultimo.res]}`}>
          {PLACAR_LABEL[ultimo.res]}
        </div>
      )}

      {!fimDeJogo && (
        <div>
          <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
            {esperando
              ? `Round ${rounds.length + 1} — escolha sua carta`
              : "Aguarde..."}
          </p>
          <div className="tela1__cartas">
            {CARTAS.map((c) => (
              <button
                key={c.key}
                className={`tela1__carta tela1__carta--clicavel ${!esperando ? "tela1__carta--disabled" : ""}`}
                onClick={() => jogar(c.key)}
                disabled={!esperando}
              >
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <span className="tela1__carta-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {fimDeJogo && (
        <div className="tela__aviso">
          💡 Isso foi <strong>você jogando manualmente</strong>. No BITS, sua{" "}
          <strong>função Python</strong> vai tomar essas decisões sozinha!
        </div>
      )}
    </div>
  );
}
