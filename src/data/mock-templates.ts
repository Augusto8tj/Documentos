
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
