
import type { TemplateMetadata } from "@/lib/types";
import { DocumentType } from "@/lib/types";

export const mockTemplates: TemplateMetadata[] = [
  {
    id: "tpl_oficio_padrao",
    name: "Modelo de Ofício Padrão",
    description: "Estrutura básica para um ofício formal, incluindo campos para destinatário, assunto e corpo do texto.",
    baseContentPreview: "Cabeçalho: [Seu Setor]\nDestinatário: [Nome/Cargo]\nAssunto: [Assunto do Ofício]\nCorpo: Prezados(as) Senhores(as), ...",
    defaultDocumentType: DocumentType.OFICIO,
  },
  {
    id: "tpl_memo_interno",
    name: "Modelo de Memorando Interno",
    description: "Formato para comunicação interna rápida entre setores ou funcionários.",
    baseContentPreview: "MEMORANDO INTERNO\nDe: [Seu Nome/Setor]\nPara: [Destinatário/Setor]\nData: [Data Atual]\nAssunto: [Assunto do Memo]\n\n[Corpo do Memorando]",
    defaultDocumentType: DocumentType.MEMORANDO,
  },
  {
    id: "tpl_ata_reuniao",
    name: "Modelo de Ata de Reunião",
    description: "Estrutura para registrar os principais pontos, decisões e encaminhamentos de uma reunião.",
    baseContentPreview: "ATA DA REUNIÃO\nData: [Data]\nHora: [Hora]\nLocal: [Local]\nParticipantes: [Lista]\nPauta: [Tópicos]\nDeliberações: [Decisões]\nEncaminhamentos: [Ações e Responsáveis]",
    defaultDocumentType: DocumentType.ATA,
  },
  {
    id: "tpl_portaria_simples",
    name: "Modelo de Portaria Simples",
    description: "Estrutura básica para uma portaria, como designações ou delegações.",
    baseContentPreview: "PORTARIA Nº [Número]/[Ano]\n\nO [Cargo da Autoridade], no uso de suas atribuições,\n\nRESOLVE:\nArt. 1º - [Texto do Artigo 1º]\nArt. 2º - Esta portaria entra em vigor na data de sua publicação.\n\n[Local e Data]\n[Nome da Autoridade]",
    defaultDocumentType: DocumentType.PORTARIA,
  },
  {
    id: "tpl_decreto_basico",
    name: "Modelo de Decreto Básico",
    description: "Formato inicial para um decreto, abordando disposições gerais.",
    baseContentPreview: "DECRETO Nº [Número]/[Ano]\n\nO [Cargo da Autoridade], no uso das atribuições que lhe confere [Base Legal],\n\nDECRETA:\nArt. 1º - [Disposição do Artigo 1º]\nArt. 2º - As despesas decorrentes da execução deste decreto correrão por conta de dotações orçamentárias próprias.\nArt. 3º - Este decreto entra em vigor na data de sua publicação.\n\n[Local e Data]\n[Nome da Autoridade]",
    defaultDocumentType: DocumentType.DECRETO,
  },
  {
    id: "tpl_solicitacao_ferias",
    name: "Modelo de Solicitação de Férias",
    description: "Um formulário simples para solicitar um período de férias.",
    baseContentPreview: "SOLICITAÇÃO DE FÉRIAS\n\nNome do Colaborador: [Seu Nome]\nSetor: [Seu Setor]\nMatrícula: [Sua Matrícula]\n\nPeríodo Solicitado:\nInício: [Data de Início]\nTérmino: [Data de Término]\nTotal de Dias: [Número de Dias]\n\nObservações: [Alguma observação adicional]\n\nData da Solicitação: [Data Atual]\nAssinatura do Colaborador: ______________________\n\nDe acordo (Chefia Imediata): ______________________",
    defaultDocumentType: DocumentType.OUTROS, // Ou poderia ser um tipo específico como "Solicitação"
  },
];

export const getTemplates = async (): Promise<TemplateMetadata[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockTemplates];
};

export const getTemplateById = async (id: string): Promise<TemplateMetadata | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockTemplates.find(template => template.id === id);
};
