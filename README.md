# Gerenciador de Documentos

Este projeto é um starter Next.js integrado ao Firebase Studio, projetado para gerenciar documentos de forma eficiente. Ele oferece funcionalidades para criar, editar e organizar documentos, com suporte a fontes externas como Google Docs e arquivos locais, além de modelos pré-definidos e numeração automática.

## Tabela de Conteúdo

- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
  - [Fontes de Documentos](#fontes-de-documentos)
    - [Google Docs](#google-docs)
    - [Arquivo Local](#arquivo-local)
  - [Modelos de Documentos](#modelos-de-documentos)
  - [Numeração Automática](#numeração-automática)
  - [Compartilhamento de Documentos](#compartilhamento-de-documentos)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Visão Geral

O Gerenciador de Documentos é uma aplicação desenvolvida com Next.js que visa simplificar o gerenciamento de documentos. Permite a criação e edição de conteúdo a partir de diversas fontes, garantindo organização e colaboração através de funcionalidades como modelos customizáveis, numeração automática e um sistema de compartilhamento seguro.

## Funcionalidades Principais

*   Criação e edição de documentos.
*   Suporte a Google Docs e arquivos locais como fontes de conteúdo.
*   Utilização de modelos pré-definidos (templates) para agilizar a criação.
*   Numeração automática de documentos com formato customizável.
*   Sistema de compartilhamento de documentos com controle de permissões.
*   Interface de usuário moderna e intuitiva.

## Instalação

Siga estes passos para configurar o projeto localmente:

1.  **Pré-requisitos:**
    *   Node.js (versão 18.x.x ou superior recomendada)
    *   npm ou yarn
    *   Firebase CLI (para deploy e gerenciamento de serviços Firebase): `npm install -g firebase-tools`

2.  **Clonar o Repositório:**
    ```bash
    git clone [URL do seu repositório]
    cd [nome-do-diretorio-do-projeto]
    ```

3.  **Instalar Dependências:**
    ```bash
    # Usando npm
    npm install

    # Ou usando yarn
    yarn install
    ```

## Configuração

1.  **Firebase:**
    *   Se este projeto utiliza serviços específicos do Firebase (ex: Firestore, Authentication), configure seu projeto Firebase.
    *   Faça login na CLI do Firebase: `firebase login`
    *   Inicialize o Firebase no projeto: `firebase init` (siga as instruções para selecionar os serviços e a pasta pública/dist, se aplicável).
    *   Certifique-se de que as configurações do `firebase.json` estão corretas para o seu projeto.

2.  **Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto com as variáveis de ambiente necessárias. Exemplo:
    ```env
    # Exemplo de variáveis (ajuste conforme necessário)
    NEXT_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=SEU_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID
    ```

## Como Usar

### Fontes de Documentos

O sistema permite que você escolha a origem do conteúdo do seu documento, oferecendo flexibilidade para diferentes fluxos de trabalho.

#### Google Docs

*   **O que é:** Seus documentos são gerenciados diretamente no Google Docs. O Gerenciador de Documentos se integra para buscar e exibir o conteúdo.
*   **Como funciona:**
    1.  **Criação Manual:** Você deve criar ou utilizar um documento existente no Google Docs. O sistema **não cria** documentos no Google Docs automaticamente.
    2.  **Conteúdo Base:** O `baseContentPreview` fornecido pelos modelos serve como **sugestão** para o conteúdo que você deve colar no seu documento do Google Docs.
    3.  **Seleção da Fonte:** Ao criar ou editar um documento na aplicação, selecione "Google Docs" como a fonte.
    4.  **ID do Documento:** Forneça o **ID do Google Doc**. Este ID é a parte única da URL do seu documento (ex: `https://docs.google.com/document/d/SEU_ID_AQUI/edit`). O sistema utiliza este ID para acessar o conteúdo.

#### Arquivo Local

*   **O que é:** Seus documentos são arquivos gerenciados em seu sistema local.
*   **Como funciona:**
    1.  **Conteúdo Base:** Utilize o `baseContentPreview` dos modelos como **sugestão** para o conteúdo do seu arquivo local.
    2.  **Seleção da Fonte:** Ao criar ou editar um documento na aplicação, selecione "Arquivo Local" como a fonte.
    3.  **Identificador:** Forneça um **Identificador do Arquivo Local**. Isso pode ser o caminho completo do arquivo, um nome de referência único, ou qualquer outra informação que ajude você a localizar e gerenciar o arquivo externamente.
    4.  **Observação:** O sistema **não acessa diretamente** o conteúdo do seu arquivo local. Este identificador é para sua referência e organização.

### Modelos de Documentos (Templates)

Modelos são estruturas pré-definidas que agilizam a criação de documentos comuns. Ao selecionar um modelo (como "Modelo de Decreto Básico" ou "Modelo de Solicitação de Férias"), você obtém um `baseContentPreview` que pode ser usado como ponto de partida.

Exemplos de modelos:

*   **Decreto Básico:** `DECRETO Nº [Número]/[Ano]...`
*   **Solicitação de Férias:** `SOLICITAÇÃO DE FÉRIAS\n\nNome do Colaborador: [Seu Nome]...`

### Numeração Automática

Documentos criados na aplicação podem receber uma numeração sequencial automática para facilitar a organização e rastreamento.

*   **Formato Padrão:** `[Prefixo do Tipo]-[Ano Atual]-[Número Sequencial]`
*   **Exemplo:** Um documento do tipo 'Ofício' criado em 2024 pode ser numerado como `OF-2024-001`.
*   **Observação:** O prefixo pode variar dependendo do tipo de documento definido (ex: "Decreto" pode ter um prefixo diferente de "Solicitação de Férias"). A contagem é reiniciada anualmente.

### Compartilhamento de Documentos

O Gerenciador de Documentos permite compartilhar documentos com outros usuários, definindo permissões específicas.

*   **Como Funciona:** Ao acessar a opção de compartilhamento, uma janela permite que você:
    *   Adicione e-mails de usuários.
    *   Defina permissões de "Pode visualizar" ou "Pode editar" para cada usuário.
    *   Remova usuários da lista de compartilhamento.
*   **Reflexo:** As alterações são salvas e refletidas (simuladamente) na aplicação. Para documentos originados do Google Docs, isso corresponde à funcionalidade de compartilhamento real no Google.
*   **Indicador Visual:** Documentos compartilhados exibirão um ícone <kbd><span style="display: inline-flex; align-items: center; padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px; background-color: #f0f0f0;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-4a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v4"></path><circle cx="8" cy="7" r="5"></circle><path d="M22 20c0-2.4-1.7-4.4-4-4.4h-1a4.1 4.1 0 0 0-4 4.4"></path></svg></span></kbd> ao lado do nome na lista de documentos.

## Estrutura do Projeto

*   `src/app/`: Contém as rotas e layouts da aplicação Next.js (incluindo páginas como `page.tsx`, `layout.tsx`).
*   `src/components/`: Componentes reutilizáveis da interface do usuário (UI), como botões, cards, formulários.
*   `src/data/`: Dados estáticos ou mockados, como os modelos de templates (`mock-templates.ts`).
*   `src/lib/`: Funções utilitárias, helpers e lógica de negócio centralizada.
*   `src/contexts/`: Contextos do React para gerenciamento de estado global da aplicação.
*   `next.config.ts`: Arquivo de configuração principal do Next.js.
*   `tailwind.config.ts`: Configurações do Tailwind CSS para estilização.
*   `.vscode/settings.json`: Configurações específicas do editor VS Code.

## Tecnologias Utilizadas

*   **Framework:** Next.js
*   **Linguagem:** TypeScript
*   **UI:** React
*   **Estilização:** Tailwind CSS
*   **Backend/Serviços:** Firebase (Autenticação, Firestore, etc. - dependendo da implementação completa)
*   **Componentes UI:** shadcn/ui (inferido pelos nomes dos arquivos em `src/components/ui/`)
*   **Ícones:** Lucide React (inferido pelo uso de `<Users />` no `help/page.tsx`)

## Contribuição

(Seção a ser preenchida com instruções sobre como outros desenvolvedores podem contribuir para este projeto. Ex: como reportar bugs, sugerir melhorias, ou submeter pull requests.)

## Licença

(Seção a ser preenchida com informações sobre a licença sob a qual o projeto é distribuído. Ex: MIT License.)
