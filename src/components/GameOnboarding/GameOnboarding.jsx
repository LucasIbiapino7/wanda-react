import { useState } from 'react'
import './GameOnboarding.css'

export default function GameOnboarding({ onFinish, isOpen, telas = [], titulo = 'WANDA' }) {

  if (!isOpen) return null

  const TOTAL = telas.length

  const [atual, setAtual] = useState(0)
  const [podeAvancar, setPodeAvancar] = useState(false)

  const ir = (n) => {
    setAtual(n)
    setPodeAvancar(false)
  }

  const avancar = () => ir(Math.min(atual + 1, TOTAL - 1))
  const voltar  = () => ir(Math.max(atual - 1, 0))
  const pular   = () => ir(TOTAL - 1)

  const ehUltima   = atual === TOTAL - 1
  const ehPrimeira = atual === 0

  const telasProps = telas.map((tela, i) => {
    const eUltima = i === TOTAL - 1
    return {
      elemento: eUltima
        ? { ...tela, props: { ...tela.props, onRever: () => ir(0), onFinish } }
        : { ...tela, props: { ...tela.props, onPronto: () => setPodeAvancar(true) } },
    }
  })

  return (
    <div className="overlay-onboarding">
      <div className="onboarding">

        <div className="onboarding__topbar">
          <span className="onboarding__logo">{titulo}</span>
          <div className="onboarding__dots">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={[
                  'onboarding__dot',
                  i < atual   ? 'onboarding__dot--done'   : '',
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

        {telasProps.map(({ elemento }, i) => (
          <div
            key={i}
            className={[
              'onboarding__screen',
              i === atual ? 'onboarding__screen--active' : '',
            ].join(' ')}
          >
            {elemento}
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
