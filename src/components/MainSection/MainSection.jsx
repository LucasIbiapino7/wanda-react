import main from "../../assets/main.png"
import "./MainSection.css"

const MainSection = () => {
  return (
    <div className="heros-section">
      <div className="content">
        <h1>Bem-vindo ao Wanda!</h1>
        <p>
          Submeta suas funções, teste sua lógica e participe de competições
          emocionantes.
        </p>
        <div className="buttons">
          <button className="primary-button">Enviar Função Agora!</button>
          <button className="secondary-button">Saiba Mais</button>
        </div>
      </div>
      <div className="image-container">
        <img
          src={main} /* Substitua pelo caminho real da imagem */
          alt="Ilustração Wanda"
          className="image"
        />
      </div>
    </div>
  );
};

export default MainSection;
