import PropTypes from "prop-types"
import GameOnboarding from "../GameOnboarding.jsx"

import Tela0BoasVindas from "../screens/tela0boasVindas.jsx"
import Tela2FuncaoJokenpo2 from "../screens/tela2funcaoJokenpo2.jsx"
import Tela3Agentes from "../screens/tela3Agentes.jsx"
import Tela4Fim from "../screens/tela4fim.jsx"

export default function GameOnboardingJokenpo2({ isOpen, onFinish }) {
   const telas = [
      <Tela0BoasVindas key="boas-vindas" />,
      <Tela2FuncaoJokenpo2 key="funcao-jokenpo-2" />,
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

GameOnboardingJokenpo2.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onFinish: PropTypes.func.isRequired
}
