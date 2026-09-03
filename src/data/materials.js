// aluno
// modulo 1
import projetoWanda from "../assets/materiais/ambos/geral/projeto-wanda.pdf"
import variaveisPDF from "../assets/materiais/ambos/modulo-1/variaveis.pdf"
import operadoresPDF from "../assets/materiais/ambos/modulo-1/operadores.pdf"
import funcoesInternasEDebugPDF from "../assets/materiais/ambos/modulo-1/funcoes-internas-e-debug.pdf"
import condicionaisPDF from "../assets/materiais/ambos/modulo-1/comandos-condicionais.pdf"
// modulo 2
import forPDF from "../assets/materiais/ambos/modulo-2/for.pdf"
import funcoesPDF from "../assets/materiais/ambos/modulo-2/funcoes.pdf"
import whilePDF from "../assets/materiais/ambos/modulo-2/while.pdf"
// modulo 3
import listaPDF from "../assets/materiais/ambos/modulo-3/lista.pdf"

// professor
// bits
import bitsPPTX from "../assets/materiais/professor/jogos/bits/bits.pptx"
import bitsMaterialApoioDOCX from "../assets/materiais/professor/jogos/bits/material-de-apoio-ao-professor-bits.docx"
import bitsPlanoDeAulaXLSX from "../assets/materiais/professor/jogos/bits/plano-de-aula-bits.xlsx"
// jokenpo
import jokenpoPPTX from "../assets/materiais/professor/jogos/jokenpo/jokenpo.pptx"
import jokenpoMaterialApoioDOCX from "../assets/materiais/professor/jogos/jokenpo/material-de-apoio-ao-professor-jokenpo.docx"
import jokenpoPlanoDeAulaXLSX from "../assets/materiais/professor/jogos/jokenpo/plano-de-aula-jokenpo.xlsx"
// modulo 1
import variaveisPPTX from "../assets/materiais/professor/modulo-1/VariaveisPROF.pptx"
import operadoresPPTX from "../assets/materiais/professor/modulo-1/OperadoresPROF.pptx"
import comandosCondicionaisPPTX from "../assets/materiais/professor/modulo-1/CondicionaisPROF.pptx"
import funcoesDebugPPTX from "../assets/materiais/professor/modulo-1/FuncoesEDebugPROF.pptx"

// modulo 2
import funcoesPPTX from "../assets/materiais/professor/modulo-2/FuncoesPROF.pptx"
import whilePPTX from "../assets/materiais/professor/modulo-2/WhilePROF.pptx"
import forPPTX from "../assets/materiais/professor/modulo-2/ForPROF.pptx"

// modulo 3
import listaPPTX from "../assets/materiais/professor/modulo-3/listaPROF.pptx"

export const materials = [
   {
      id: 1,
      fileName: "Projeto Wanda",
      category: "Geral",
      formats: [
         { type: "PDF", url: projetoWanda, audience: "ambos" }
      ]
   },
   {
      id: 2,
      fileName: "Variáveis",
      category: "Módulo 1",
      formats: [
         { type: "PDF", url: variaveisPDF, audience: "ambos" },
         { type: "PPTX", url: variaveisPPTX, audience: "professor" }
      ]
   },
   {
      id: 3,
      fileName: "Operadores",
      category: "Módulo 1",
      formats: [
         { type: "PDF", url: operadoresPDF, audience: "ambos" },
         { type: "PPTX", url: operadoresPPTX, audience: "professor" }
      ]
   },
   {
      id: 4,
      fileName: "Comandos Condicionais",
      category: "Módulo 1",
      formats: [
         { type: "PDF", url: condicionaisPDF, audience: "ambos" },
         { type: "PPTX", url: comandosCondicionaisPPTX, audience: "professor" }
      ]
   },
   {
      id: 5,
      fileName: "Funções internas e Debug",
      category: "Módulo 1",
      formats: [
         { type: "PDF", url: funcoesInternasEDebugPDF, audience: "ambos" },
         { type: "PPTX", url: funcoesDebugPPTX, audience: "professor" }
      ]
   },
   {
      id: 6,
      fileName: "For",
      category: "Módulo 2",
      formats: [
         { type: "PDF", url: forPDF, audience: "ambos" },
         { type: "PPTX", url: forPPTX, audience: "professor" }
      ]
   },
   {
      id: 7,
      fileName: "Funções",
      category: "Módulo 2",
      formats: [
         { type: "PDF", url: funcoesPDF, audience: "ambos" },
         { type: "PPTX", url: funcoesPPTX, audience: "professor" }
      ]
   },
   {
      id: 8,
      fileName: "While",
      category: "Módulo 2",
      formats: [
         { type: "PDF", url: whilePDF, audience: "ambos" },
         { type: "PPTX", url: whilePPTX, audience: "professor" }
      ]
   },
   {
      id: 9,
      fileName: "Lista",
      category: "Módulo 3",
      formats: [
         { type: "PDF", url: listaPDF, audience: "ambos" },
         { type: "PPTX", url: listaPPTX, audience: "professor" }
      ]
   },
   {
      id: 10,
      fileName: "Bits",
      category: "Jogos",
      resources: [
         { label: "Slides", type: "PPTX", url: bitsPPTX, audience: "professor" },
         { label: "Material de apoio ao professor", type: "DOCX", url: bitsMaterialApoioDOCX, audience: "professor" },
         { label: "Plano de Aula", type: "XLSX", url: bitsPlanoDeAulaXLSX, audience: "professor" }
      ]
   },
   {
      id: 11,
      fileName: "Jokenpô",
      category: "Jogos",
      resources: [
         { label: "Slides", type: "PPTX", url: jokenpoPPTX, audience: "professor" },
         { label: "Material de apoio ao professor", type: "DOCX", url: jokenpoMaterialApoioDOCX, audience: "professor" },
         { label: "Plano de Aula", type: "XLSX", url: jokenpoPlanoDeAulaXLSX, audience: "professor" }
      ]
   }
]