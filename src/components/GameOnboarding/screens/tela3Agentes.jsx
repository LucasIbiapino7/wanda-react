import { useState, useEffect } from 'react'
import './telas.css'
import timmyImage from "../../../assets/timmy.png"
import cosmoImage from "../../../assets/cosmo-avatar.png"
import wandaImage from "../../../assets/wanda.png"

const CODIGO_EXEMPLO = `def strategy(card1, card2, card3):
    return "pedra"`

const AGENTES = [
  {
    key: 'VERBOSE',
    avatar: cosmoImage,
    alt: 'Cosmo-avatar',
    nome: 'Cosmo',
    tag: 'Detalhista',
    preview: `Olha, sua função está retornando sempre "pedra", independente das cartas que você tem na mão! Isso significa que os parâmetros card1, card2 e card3 estão sendo completamente ignorados. Sua estratégia vai funcionar, mas vai ser bastante previsível — qualquer adversário que perceber isso pode se adaptar facilmente. Que tal usar as cartas disponíveis pra tomar uma decisão mais inteligente?`,
  },
  {
    key: 'SUCCINCT',
    avatar: timmyImage,
    alt: 'timmy-avatar',
    nome: 'Timmy',
    tag: 'Direto',
    preview: `Retornando sempre "pedra". Nenhum parâmetro usado. Estratégia previsível — considere usar card1, card2 ou card3 pra variar.`,
  },
  {
    key: 'INTERMEDIATE',
    avatar: wandaImage,
    alt: 'wanda-avatar',
    nome: 'Wanda',
    tag: 'Equilibrado',
    preview: `Sua função sempre retorna "pedra", sem considerar as cartas da sua mão. Isso funciona, mas torna sua estratégia previsível. Tente usar card1, card2 ou card3 pra tomar decisões mais adaptativas — por exemplo, se tiver papel na mão, pode ser uma escolha mais forte dependendo do contexto.`,
  },
]

const ACOES = [
  {
    emoji: '💬',
    nome: 'Feedback',
    cor: 'tela3__acao--azul',
    desc: 'Analisa seu código sem executar. O agente verifica os parâmetros que você usou e comenta sua estratégia.',
  },
  {
    emoji: '▶️',
    nome: 'Run',
    cor: 'tela3__acao--verde',
    desc: 'Roda 10 testes no seu código e mostra quantos passaram. Não salva nada — é só pra testar.',
  },
  {
    emoji: '✅',
    nome: 'Submeter',
    cor: 'tela3__acao--amarelo',
    desc: 'Valida e salva sua função. Só depois de submeter você pode desafiar outros alunos.',
  },
]

export default function Tela3Agentes({ onPronto }) {
  const [agenteSelecionado, setAgenteSelecionado] = useState(null)

  useEffect(() => {
    if (agenteSelecionado) onPronto()
  }, [agenteSelecionado])

  return (
    <div className="tela">

      <div className="tela__fala">
        <div className="tela__avatar"><img src={wandaImage} alt="wanda-avatar"/></div>
        <div className="tela__bubble">
          No editor você conta com <strong>3 agentes</strong> que analisam
          seu código. Clique em cada um pra ver como eles respondem! 👇
        </div>
      </div>

      {/* Agentes */}
      <div>
        <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
          Escolha um agente pra conhecer
        </p>
        <div className="tela3__agentes">
          {AGENTES.map(a => (
            <button
              key={a.key}
              className={`tela3__agente ${agenteSelecionado?.key === a.key ? 'tela3__agente--ativo' : ''}`}
              onClick={() => setAgenteSelecionado(a)}
            >
              <span className="tela3__agente-emoji"><img src={a.avatar} alt={a.alt}/></span>
              <span className="tela3__agente-nome">{a.nome}</span>
              <span className="tela3__agente-tag">{a.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview do agente */}
      {agenteSelecionado && (
        <div className="tela3__preview tela2__fade">
          <div className="tela3__preview-codigo">
            <span className="tela2__kw">def</span>{' '}
            <span className="tela2__fn">strategy</span>
            (<span className="tela2__param">card1</span>,{' '}
            <span className="tela2__param">card2</span>,{' '}
            <span className="tela2__param">card3</span>):<br />
            <span className="tela2__indent">
              <span className="tela2__kw">return</span>{' '}
              <span className="tela2__str">"pedra"</span>
            </span>
          </div>
          <div className="tela3__preview-bubble">
            <span className="tela3__preview-quem">
              {agenteSelecionado.emoji} {agenteSelecionado.nome} diria:
            </span>
            <p>{agenteSelecionado.preview}</p>
          </div>
        </div>
      )}

      {/* Ações — aparecem depois de clicar um agente */}
      {agenteSelecionado && (
        <div className="tela2__fade">
          <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
            O que cada ação faz
          </p>
          <div className="tela3__acoes">
            {ACOES.map(a => (
              <div key={a.nome} className={`tela3__acao ${a.cor}`}>
                <span className="tela3__acao-emoji">{a.emoji}</span>
                <span className="tela3__acao-nome">{a.nome}</span>
                <span className="tela3__acao-desc">{a.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}