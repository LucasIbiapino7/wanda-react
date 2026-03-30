import GameOnboarding from '../GameOnboarding.jsx'

import Tela0BoasVindas from '../screens/tela0boasVindas'
import Tela1Jogo       from '../screens/tela1Jogo'
import Tela2Funcao     from '../screens/tela2funcao'
import Tela3Agentes    from '../screens/tela3Agentes'
import Tela4Fim        from '../screens/tela4fim'

export default function GameOnboardingJokenpo({ isOpen, onFinish }) {
  const telas = [
    <Tela0BoasVindas />,
    <Tela1Jogo />,
    <Tela2Funcao />,
    <Tela3Agentes />,
    <Tela4Fim />,
  ]

  return (
    <GameOnboarding
      isOpen={isOpen}
      onFinish={onFinish}
      telas={telas}
      titulo="WANDA"
    />
  )
}
