import './telas.css'

const RESUMO = [
  { emoji: '✍️', texto: 'Você programa uma estratégia em Python' },
  { emoji: '🎲', texto: 'As cartas são sorteadas e divididas entre os jogadores' },
  { emoji: '⚔️', texto: 'Sua função decide qual carta jogar automaticamente' },
  { emoji: '🤖', texto: 'Os agentes ajudam você a melhorar seu código' },
]

export default function Tela4Fim({ onRever, onFinish }) {
  return (
    <div className="tela tela4__container">

      <div className="tela4__topo">
        <div className="tela4__trofeu">🏆</div>
        <h2 className="tela4__titulo">Pronto para batalhar!</h2>
        <p className="tela4__subtexto">
          Você já sabe tudo que precisa pra escrever sua primeira estratégia.
        </p>
      </div>

      <div>
        <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
          O que você aprendeu
        </p>
        <div className="tela4__resumo">
          {RESUMO.map((r, i) => (
            <div key={i} className="tela4__resumo-item">
              <span className="tela4__resumo-emoji">{r.emoji}</span>
              <span className="tela4__resumo-txt">{r.texto}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tela4__acoes">
        <button className="tela4__btn-rever" onClick={onRever}>
          ↺ Rever tutorial
        </button>
        <button className="tela4__btn-comecar" onClick={onFinish}>
          Começar a programar! 🚀
        </button>
      </div>

    </div>
  )
}