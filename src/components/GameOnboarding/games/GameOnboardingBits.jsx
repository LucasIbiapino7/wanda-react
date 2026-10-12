import PropTypes from "prop-types"
import GameOnboarding from "../GameOnboarding"

import Tela0BoasVindas from "../screens/tela0boasVindas"
import Tela1JogoBits from "../screens/tela1JogoBits"
import Tela2FuncaoBits from "../screens/tela2FuncaoBits"
import Tela3Agentes from "../screens/tela3Agentes"
import Tela4Fim from "../screens/tela4fim"

export default function GameOnboardingBits({ isOpen, onFinish }) {
   const telas = [
      <Tela0BoasVindas key="boas-vindas" />,
      <Tela1JogoBits key="jogo-bits" />,
      <Tela2FuncaoBits key="funcao-bits" />,
      <Tela3Agentes key="agentes" />,
      <Tela4Fim key="fim" />
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

GameOnboardingBits.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onFinish: PropTypes.func.isRequired
}