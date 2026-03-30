export const tourSteps = [
  {
    target: ".agent-tabs",
    content: (
      <div>
        Aqui está a área dos assistentes: <strong>Cosmo</strong>,{" "}
        <strong>Timmy</strong> ou <strong>Wanda</strong>, cada um com um estilo
        diferente de respostas, como visto anteriormente.
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: ".container-buttons-send",
    content: (
      <div>
        Esta é a área de Ações Principais: <strong>Feedback</strong>,{" "}
        <strong>Run</strong> e <strong>Submeter</strong>. Em cada solicitação,
        os assistenntes sempre verificam se existe algum erro de sintaxe e
        execução no seu código. Além disso, cada um dos botões podem ajudar você
        de uma forma específica, como veremos nos próximos passos.
      </div>
    ),
    placement: "top",
    disableBeacon: true,
  },
  {
    target: ".send-button",
    content: (
      <div>
        Clique em <strong>Feedback</strong> para receber uma análise de como
        você está usando os parâmetros disponíveis na sua função!
      </div>
    ),
    placement: "top",
    disableBeacon: true,
  },
  {
    target: ".run-button",
    content: (
      <div>
        Clique em <strong>Run</strong> para executar a sua função em situações
        reais do Jokenpo e se os valores de saída da sua função estão dentro do
        esperado!
      </div>
    ),
    placement: "top",
    disableBeacon: true,
  },
  {
    target: ".submit-button",
    content: (
      <div>
        Use <strong>Submeter</strong> para enviar a versão final da sua
        estratégia e passar para o próximo passo!
      </div>
    ),
    placement: "top",
    disableBeacon: true,
  },
  {
    target: ".editor-section",
    content: (
      <div>
        Este é o editor onde você digita sua função <code>strategy</code> antes
        de enviá-la para o assistente ou submetê-la.
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: ".agent-tabs",
    content: (
      <div>
        Agora que viu a personalidade de cada agente, como os botões funcionam e
        o editor de código, selecione o seu inicialmente e fique à vontade para
        começar a escrever a sua função!
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
];
