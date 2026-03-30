import { useEffect } from "react";
import "./telas.css";
import wandaImage from "../../../assets/wanda.png"

const passos = [
  {
    icon: "✍️",
    titulo: "Você programa",
    desc: "Escreve uma função em Python com sua estratégia",
  },
  {
    icon: "⚔️",
    titulo: "O sistema batalha",
    desc: "Sua função enfrenta a de outro aluno por meio de desafios ou torneios",
  },
  {
    icon: "🏆",
    titulo: "Você evolui",
    desc: "Quanto melhor sua lógica, mais alto você sobe no ranking",
  },
];

export default function Tela0BoasVindas({ onPronto }) {
  useEffect(() => {
    onPronto();
  }, []);

  return (
    <div className="tela">
      <div className="tela__fala">
        <div className="tela__avatar"><img src={wandaImage} alt="wanda-image"/></div>
        <div className="tela__bubble">
          Olá! Eu sou a <strong>Wanda</strong>. Antes de programar, deixa eu te
          mostrar como tudo funciona. São só 4 passos rápidos!
        </div>
      </div>

      <p className="tela__subtitulo">Como o Wanda funciona</p>

      <div className="tela0__passos">
        {passos.map((p, i) => (
          <>
            <div key={i} className="tela0__passo">
              <div className="tela0__passo-icon">{p.icon}</div>
              <div className="tela0__passo-titulo">{p.titulo}</div>
              <div className="tela0__passo-desc">{p.desc}</div>
            </div>
            {i < passos.length - 1 && (
              <div key={`seta-${i}`} className="tela0__seta">
                →
              </div>
            )}
          </>
        ))}
      </div>
      <div className="tela__aviso">
        💡 Você <strong>não joga na hora</strong> — você programa como vai
        jogar. A batalha acontece depois, onde você pode desafiar seus amigos ou
        participar de torneios!
      </div>
    </div>
  );
}
