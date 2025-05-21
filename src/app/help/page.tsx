
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ListChecks, Search, Users, FilePlus2, Edit, Eye, Share2, Trash2, Filter, FolderOpen, ExternalLink, Archive, LayoutDashboard, Settings, LifeBuoy, MoreVertical } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Central de Ajuda DocFlow</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Encontre respostas e guias para usar o sistema de gerenciamento de documentos.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><LayoutDashboard className="h-6 w-6 text-primary" /> Visão Geral do Sistema</CardTitle>
          <CardDescription>Bem-vindo ao DocFlow, seu sistema para gerenciar documentos de forma eficiente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            O DocFlow foi projetado para ajudar você a organizar, numerar, e rastrear seus documentos importantes.
            Você pode criar diferentes tipos de documentos, associá-los a arquivos do Google Docs, referenciar arquivos locais,
            ou simplesmente gerenciá-los internamente no sistema.
          </p>
          <p>
            A navegação principal é feita pela barra lateral à esquerda, que dá acesso rápido ao Painel, à criação de novos documentos,
            configurações e esta página de ajuda. O cabeçalho superior exibe o nome do sistema e opções da sua conta.
          </p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-6">
        <AccordionItem value="item-1">
          <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardHeader className="p-0 w-full text-left">
                <CardTitle className="text-xl flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-primary" /> Gerenciando Documentos</CardTitle>
                <CardDescription>Como criar, visualizar e editar seus documentos.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 text-muted-foreground">
                <h3 className="font-semibold text-lg text-foreground">Criando um Novo Documento</h3>
                <p>
                  Para criar um novo documento, clique em <span className="font-semibold text-primary">"Criar Documento"</span> na barra lateral.
                  Você precisará preencher:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><span className="font-semibold">Nome do Documento:</span> Um título descritivo para o seu documento.</li>
                  <li><span className="font-semibold">Tipo de Documento:</span> Selecione entre Ofício, Memorando, Portaria, etc. Isso ajudará na organização e na numeração.</li>
                  <li>
                    <span className="font-semibold">Fonte do Documento:</span>
                    <ul className="list-circle list-inside space-y-1 pl-6 mt-1">
                      <li><span className="font-semibold">Interno:</span> O documento é gerenciado apenas no sistema, sem um arquivo externo associado.</li>
                      <li><span className="font-semibold">Google Docs:</span> O documento está no Google Docs. Você precisará fornecer o ID do documento (encontrado na URL do Google Doc) ao editar os detalhes. Inicialmente, um ID simulado é criado.</li>
                      <li><span className="font-semibold">Arquivo Local:</span> O documento é um arquivo no seu computador ou servidor. Você fornecerá um "Identificador do Arquivo Local" (ex: caminho do arquivo, nome de referência) para sua própria organização. O sistema não acessa este arquivo diretamente.</li>
                    </ul>
                  </li>
                </ul>
                <p>A <span className="font-semibold">Numeração Automática</span> será aplicada com base no tipo de documento e no ano atual (ex: OF-2024-001).</p>

                <h3 className="font-semibold text-lg text-foreground mt-4">Visualizando Detalhes de um Documento</h3>
                <p>
                  Na lista do Painel, clique no nome de um documento para ver sua página de detalhes.
                  Lá você encontrará todas as informações, como número, status, datas, fonte e com quem foi compartilhado (simulado).
                  Se for um documento do Google Docs com ID válido, haverá um botão para <span className="font-semibold text-primary">"Abrir no Google Docs"</span>.
                </p>

                <h3 className="font-semibold text-lg text-foreground mt-4">Editando um Documento</h3>
                <p>
                  Na página de detalhes, clique no botão <span className="font-semibold text-primary flex items-center gap-1"><Edit className="h-4 w-4 inline-block"/>Editar Detalhes</span>.
                  Você poderá alterar o nome, tipo e a fonte do documento (incluindo o ID do Google Docs ou o Identificador do Arquivo Local).
                </p>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-2">
          <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardHeader className="p-0 w-full text-left">
                <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /> Filtrando Documentos</CardTitle>
                <CardDescription>Encontre rapidamente os documentos que você precisa.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 text-muted-foreground">
                <p>
                  A seção <span className="font-semibold text-primary">"Filtros"</span> no Painel (acima da lista de documentos) é recolhível e permite refinar sua busca:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><span className="font-semibold">Pesquisar Nome/Número:</span> Digite qualquer termo para buscar no nome ou no número do documento.</li>
                  <li><span className="font-semibold">Tipo:</span> Selecione um tipo específico (Ofício, Memorando, etc.) ou "Todos os tipos".</li>
                  <li><span className="font-semibold">Status:</span> Filtre por "Rascunho", "Publicado" ou "Arquivado".</li>
                  <li><span className="font-semibold">Fonte do Documento:</span> Escolha entre "Interno", "Google Docs" ou "Arquivo Local".</li>
                  <li>
                    <span className="font-semibold">Data de Criação / Data Últ. Modificação:</span>
                    <ul className="list-circle list-inside space-y-1 pl-6 mt-1">
                      <li>Selecione o <span className="font-semibold">período</span> desejado: Qualquer, Dia, Semana, Mês ou Ano.</li>
                      <li>Em seguida, clique no botão ao lado para <span className="font-semibold">escolher uma data</span> no calendário. O sistema usará essa data para filtrar de acordo com o período selecionado.</li>
                    </ul>
                  </li>
                   <li><span className="font-semibold">Compartilhado com:</span> Digite um e-mail para encontrar documentos compartilhados com esse usuário.</li>
                </ul>
                <p>Use o botão <span className="font-semibold text-primary flex items-center gap-1"><ListChecks className="h-4 w-4 inline-block"/>Limpar Filtros</span> para remover todas as seleções e ver todos os documentos.</p>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-3">
          <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardHeader className="p-0 w-full text-left">
                <CardTitle className="text-xl flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Compartilhando Documentos</CardTitle>
                <CardDescription>Como (simuladamente) compartilhar documentos com outros usuários.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Na lista de documentos, no menu de ações de cada item (ícone de três pontos verticais), você encontrará a opção
                  <span className="font-semibold text-primary flex items-center gap-1"><Share2 className="h-4 w-4 inline-block"/>Compartilhar</span>.
                </p>
                <p>
                  Ao clicar, uma janela se abrirá permitindo que você:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Adicione e-mails de usuários.</li>
                  <li>Defina permissões de "Pode visualizar" ou "Pode editar" para cada usuário.</li>
                  <li>Remova usuários da lista de compartilhamento.</li>
                </ul>
                <p>
                  As alterações são salvas e refletidas (simuladamente) no sistema. Para documentos do Google Docs, isso representaria o compartilhamento real no Google.
                  Documentos compartilhados exibirão um ícone <Users className="h-4 w-4 inline-block" /> ao lado do nome na lista.
                </p>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

         <AccordionItem value="item-4">
          <Card className="shadow-md">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardHeader className="p-0 w-full text-left">
                <CardTitle className="text-xl flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Ações Comuns na Lista de Documentos</CardTitle>
                <CardDescription>Entenda as opções disponíveis para cada documento.</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 text-muted-foreground">
                <p>Ao lado de cada documento na lista, você verá um menu de ações (ícone <MoreVertical className="inline-block h-4 w-4" />):</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><Eye className="inline-block h-4 w-4 mr-2 text-primary" /><strong>Visualizar:</strong> Abre a página de detalhes do documento.</li>
                  <li><Edit className="inline-block h-4 w-4 mr-2 text-primary" /><strong>Editar:</strong> Leva você para o formulário de edição do documento.</li>
                  <li><ExternalLink className="inline-block h-4 w-4 mr-2 text-primary" /><strong>Abrir no Google Docs:</strong> (Condicional) Se o documento for do tipo Google Docs e tiver um ID válido, esta opção abrirá o documento diretamente no Google Docs em uma nova aba.</li>
                  <li><Share2 className="inline-block h-4 w-4 mr-2 text-primary" /><strong>Compartilhar:</strong> Abre a janela de gerenciamento de compartilhamento.</li>
                  <li><Trash2 className="inline-block h-4 w-4 mr-2 text-destructive" /><strong>Excluir:</strong> Remove o documento da lista. (Atualmente, esta ação é apenas visual no sistema e não move para uma lixeira).</li>
                </ul>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

      </Accordion>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><Settings className="h-6 w-6 text-primary" /> Configurações e Suporte</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            A opção <span className="font-semibold text-primary flex items-center gap-1"><Settings className="h-4 w-4 inline-block"/>Configurações</span> na barra lateral está reservada para futuras personalizações do sistema.
          </p>
          <p>
            Se precisar de mais ajuda ou encontrar algum problema, entre em contato com o suporte do sistema.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
