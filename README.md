# Bookio API

API de gerenciamento de biblioteca que permite controle de empréstimos, agendamentos e penalidades.

## 📚 Sobre o Projeto

Bookio é uma API desenvolvida para auxiliar bibliotecas no gerenciamento de seu acervo, leitores e empréstimos. O sistema permite que bibliotecas gerenciem seus livros, leitores, empréstimos e agendamentos de forma eficiente e automatizada.

## 🔧 Funcionalidades Principais

### 📖 Gerenciamento de Livros

- Cadastro de livros com informações como título, autor, gênero e quantidade disponível
- Busca de livros por título, gênero ou ID
- Controle de disponibilidade
- Rastreamento dos livros mais emprestados
- Atualização e remoção de livros do acervo

### 👥 Gerenciamento de Leitores

- Cadastro de leitores com informações pessoais (nome, CPF, endereço)
- Sistema de suspensão automática por atrasos
- Verificação de penalidades pendentes
- Histórico de empréstimos

### 📅 Sistema de Empréstimos

- Registro de empréstimos com data de devolução
- Verificação automática de:
  - Disponibilidade do livro
  - Status do leitor (suspenso/ativo)
  - Penalidades pendentes
  - Agendamentos existentes
- Controle de devoluções
- Geração automática de penalidades para atrasos

### 🗓️ Sistema de Agendamentos

- Agendamento de livros que estão emprestados
- Verificação automática de disponibilidade
- Prioridade para leitores com agendamento na retirada
- Cancelamento de agendamentos

### 💰 Sistema de Penalidades

- Geração automática de multas por atraso
- Suspensão automática do leitor por dia de atraso no pagamento
- Controle de pagamentos
- Histórico de penalidades

## ⚙️ Regras de Negócio

### 📚 Livros

1. Cada livro deve ter um título único dentro da mesma biblioteca
2. O número de exemplares disponíveis não pode ser negativo
3. O sistema mantém registro do número total de empréstimos de cada livro

### 👤 Leitores

1. CPF e e-mail devem ser únicos no sistema
2. Leitores suspensos não podem realizar empréstimos
3. Leitores com penalidades pendentes não podem realizar empréstimos
4. A suspensão é incrementada automaticamente (1 dia) para cada dia de atraso no pagamento de penalidades

### 📖 Empréstimos

1. Só podem ser realizados se:
   - O livro estiver disponível
   - O leitor não estiver suspenso
   - O leitor não tiver penalidades pendentes
   - Não houver agendamentos prioritários de outros leitores
2. O sistema verifica empréstimos atrasados a cada 15 minutos
3. Empréstimos atrasados geram penalidades automaticamente

### 📅 Agendamentos

1. Só podem ser feitos para livros que não estão disponíveis
2. Um leitor não pode agendar o mesmo livro mais de uma vez
3. O sistema verifica agendamentos expirados periodicamente
4. Agendamentos têm prioridade sobre novos empréstimos

### 💰 Penalidades

1. São geradas automaticamente para empréstimos atrasados
2. O valor padrão da multa é configurável
3. O prazo para pagamento é de 7 dias após a geração
4. O não pagamento resulta em suspensão automática do leitor
5. A suspensão é incrementada diariamente até o pagamento

## 🔄 Serviços Automáticos

A API possui três serviços que rodam em background:

1. **LoanMonitoringService**
   - Verifica empréstimos atrasados a cada 15 minutos
   - Gera penalidades automaticamente para atrasos

2. **PenalityVerificationService**
   - Verifica penalidades não pagas diariamente
   - Incrementa a suspensão dos leitores com pendências

3. **SchedulingVerificationService**
   - Verifica agendamentos expirados a cada 3 minutos
   - Atualiza o status dos agendamentos automaticamente

## 🚫 Tratamento de Erros

O sistema possui tratamentos específicos para diferentes situações:

- `NotAllowedError`: Operações não permitidas (com mensagens descritivas em português)
- `NotFoundError`: Recursos não encontrados
- `InvalidCredentialsError`: Problemas de autenticação
- `LoanOverdueError`: Empréstimos atrasados
- `PendingPenalitiesError`: Penalidades pendentes

## 🏛️ Entidades Principais

### Library (Biblioteca)

- Informações básicas (nome, CNPJ, endereço)
- Gerenciamento de acervo
- Controle de leitores

### Reader (Leitor)

- Dados pessoais
- Status (ativo/suspenso)
- Histórico de empréstimos e penalidades

### Book (Livro)

- Informações bibliográficas
- Controle de disponibilidade
- Estatísticas de empréstimos

### Loan (Empréstimo)

- Vinculação leitor-livro
- Datas de empréstimo e devolução
- Status do empréstimo

### Scheduling (Agendamento)

- Reserva de livros
- Prioridade de empréstimo
- Status do agendamento

### Penality (Penalidade)

- Multas por atraso
- Controle de pagamentos
- Impacto na suspensão do leitor

## 🔒 Segurança

O sistema implementa:

- Autenticação de usuários
- Verificação de permissões por tipo de usuário
- Proteção de rotas sensíveis
- Hash de senhas com bcryptjs

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js
- pnpm
- TypeScript

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar em desenvolvimento
pnpm dev
```
