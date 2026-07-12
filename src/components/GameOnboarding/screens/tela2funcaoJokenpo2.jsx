import { useEffect } from "react"
import "./telas.css"
import pixelImage from "../../../assets/mascotes/pixel.png"
import cardPaper from "../../../assets/jokenpo/papel.png"
import cardStone from "../../../assets/jokenpo/pedra.png"
import cardScissors from "../../../assets/jokenpo/tesoura.png"
import PropTypes from "prop-types"

const IMAGE = {
   pedra: cardStone,
   papel: cardPaper,
   tesoura: cardScissors
}

const exemplo = {
   jogador: ["pedra", "pedra"],
   adversario: ["papel", "tesoura"]
}

export default function Tela2FuncaoJokenpo2({ onPronto }) {
   useEffect(() => {
      onPronto()
   }, [onPronto])

   return (
      <div className="tela">
         <div className="tela__fala">
            <div className="tela__avatar">
               <img src={pixelImage} alt="Pixel" />
            </div>

            <div className="tela__bubble">
               Agora estamos na <strong>Função 2</strong>. Ela decide sua jogada
               no segundo round do Jokenpô. Você recebe duas cartas suas e também
               consegue ver as duas cartas que sobraram para o adversário.
            </div>
         </div>

         <div className="tela__aviso">
            Este é apenas um exemplo. Em cada partida, as cartas podem aparecer
            em outra ordem e podem vir repetidas, como duas pedras ou dois papéis.
            Por isso, crie uma estratégia lógica em vez de decorar posições fixas.
         </div>

         <div className="tela2__secao tela2__fade">
            <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
               Exemplo de cartas recebidas
            </p>

            <div className="tela2__maos">
               <div className="tela2__lado">
                  <span className="tela2__lado-label">Suas cartas</span>
                  <div className="tela2__cartas">
                     {exemplo.jogador.map((carta, index) => (
                        <div key={`${carta}-${index}`} className="tela2__carta tela2__carta--revelada">
                           <img src={IMAGE[carta]} alt={carta} />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="tela2__vs">VS</div>

               <div className="tela2__lado">
                  <span className="tela2__lado-label">Cartas do adversário</span>
                  <div className="tela2__cartas">
                     {exemplo.adversario.map((carta, index) => (
                        <div key={`${carta}-${index}`} className="tela2__carta tela2__carta--revelada">
                           <img src={IMAGE[carta]} alt={carta} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="tela2__secao tela2__fade">
            <p className="tela__subtitulo" style={{ marginBottom: 10 }}>
               É isso que sua função recebe
            </p>

            <div className="tela2__codigo">
               <span className="tela2__kw">def</span>{" "}
               <span className="tela2__fn">strategy</span>(
               <span className="tela2__param">card1</span>,{" "}
               <span className="tela2__param">card2</span>,{" "}
               <span className="tela2__param">opponentCard1</span>,{" "}
               <span className="tela2__param">opponentCard2</span>):
               <br />

               <span className="tela2__indent">
                  <span className="tela2__cmt"># card1 = </span>
                  <span className="tela2__val">pedra</span>
               </span>
               <br />

               <span className="tela2__indent">
                  <span className="tela2__cmt"># card2 = </span>
                  <span className="tela2__val">pedra</span>
               </span>
               <br />

               <span className="tela2__indent">
                  <span className="tela2__cmt"># opponentCard1 = </span>
                  <span className="tela2__val">&quot;papel&quot;</span>
               </span>
               <br />

               <span className="tela2__indent">
                  <span className="tela2__cmt"># opponentCard2 = </span>
                  <span className="tela2__val">&quot;tesoura&quot;</span>
               </span>
               <br />

               <span className="tela2__indent">
                  <span className="tela2__kw">return</span>{" "}
                  <span className="tela2__return--destaque">???</span>
               </span>
            </div>

            <div className="tela2__retorno-hint tela2__fade">
               Sua função deve retornar uma das cartas que você possui:
               <span className="tela2__tag">&quot;pedra&quot;</span>
               <span className="tela2__tag">&quot;papel&quot;</span>
               <span className="tela2__tag">&quot;tesoura&quot;</span>
            </div>
         </div>
      </div>
   )
}

Tela2FuncaoJokenpo2.propTypes = {
   onPronto: PropTypes.func.isRequired
}
