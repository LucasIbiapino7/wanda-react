import GameOnboarding from '../GameOnboarding'

import Tela0BoasVindas  from '../screens/tela0boasVindas'
import Tela1JogoBits    from '../screens/tela1JogoBits'
import Tela2FuncaoBits  from '../screens/tela2FuncaoBits'
import Tela3Agentes     from '../screens/tela3Agentes'
import Tela4Fim         from '../screens/tela4fim'

export default function GameOnboardingBits({ isOpen, onFinish }) {
  const telas = [
    <Tela0BoasVindas />,
    <Tela1JogoBits />,
    <Tela2FuncaoBits />,
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
