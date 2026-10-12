import PropTypes from "prop-types"
import GameOnboarding from "../GameOnboarding.jsx"

import Tela0BoasVindas from "../screens/tela0boasVindas"
import Tela1Jogo from "../screens/tela1Jogo"
import Tela2Funcao from "../screens/tela2funcao"
import Tela3Agentes from "../screens/tela3Agentes"
import Tela4Fim from "../screens/tela4fim"

export default function GameOnboardingJokenpo({ isOpen, onFinish }) {
   const telas = [
      <Tela0BoasVindas key="boas-vindas" />,
      <Tela1Jogo key="jogo" />,
      <Tela2Funcao key="funcao" />,
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

GameOnboardingJokenpo.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onFinish: PropTypes.func.isRequired
}