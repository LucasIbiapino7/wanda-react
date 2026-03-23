import { useState } from 'react'
import './GameOnboarding.css'

import Tela0BoasVindas from './screens/tela0boasVindas'
import Tela1Jogo from './screens/tela1Jogo'
import Tela2Funcao from './screens/tela2funcao'
import Tela3Agentes from './screens/tela3Agentes'
import Tela4Fim from './screens/tela4fim'

const TOTAL = 5

export default function GameOnboarding({ onFinish, isOpen }) {

  if (!isOpen) {
    return null;
  }

  const [atual, setAtual] = useState(0)
  const [podeAvancar, setPodeAvancar] = useState(false)

  const ir = (n) => {
    setAtual(n)
    setPodeAvancar(false)
  }

  const avancar = () => ir(Math.min(atual + 1, TOTAL - 1))
  const voltar = () => ir(Math.max(atual - 1, 0))
  const pular = () => ir(TOTAL - 1)

  const telas = [
    <Tela0BoasVindas onPronto={() => setPodeAvancar(true)} />,
    <Tela1Jogo onPronto={() => setPodeAvancar(true)} />,
    <Tela2Funcao onPronto={() => setPodeAvancar(true)} />,
    <Tela3Agentes onPronto={() => setPodeAvancar(true)} />,
    <Tela4Fim onRever={() => ir(0)} onFinish={onFinish} />,
  ]

  const ehUltima  = atual === TOTAL - 1
  const ehPrimeira = atual === 0

  return (
    <div className="overlay-onboarding">
      <div className="onboarding">
        <div className="onboarding__topbar">
          <span className="onboarding__logo">WANDA</span>
          <div className="onboarding__dots">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={[
                  'onboarding__dot',
                  i < atual  ? 'onboarding__dot--done'   : '',
                  i === atual ? 'onboarding__dot--active' : '',
                ].join(' ')}
              />
            ))}
          </div>
          {!ehUltima && (
            <button className="onboarding__skip" onClick={pular}>
              Pular tudo
            </button>
          )}
          {ehUltima && <div style={{ width: 60 }} />}
        </div>
        {telas.map((tela, i) => (
          <div
            key={i}
            className={[
              'onboarding__screen',
              i === atual ? 'onboarding__screen--active' : '',
            ].join(' ')}
          >
            {tela}
          </div>
        ))}
        {!ehUltima && (
          <div className="onboarding__nav">
            {!ehPrimeira
              ? <button className="onboarding__btn-back" onClick={voltar}>← Voltar</button>
              : <div />
            }
            <button
              className="onboarding__btn-next"
              onClick={avancar}
              disabled={!podeAvancar}
            >
              {atual === TOTAL - 2 ? 'Finalizar →' : 'Próximo →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}