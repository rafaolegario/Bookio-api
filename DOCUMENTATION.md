# Documentação Técnica Detalhada - Bookio API

## Estrutura de Dependências e Restrições

### 1. Sistema de Empréstimos

#### Pré-requisitos para Realizar um Empréstimo

- O leitor precisa estar cadastrado e ativo no sistema
- O livro deve existir e ter exemplares disponíveis
- O leitor não pode estar suspenso
- O leitor não pode ter penalidades pendentes
- Se houver agendamento do livro por outro leitor, o empréstimo não será permitido

#### Fluxo de Empréstimo

1. Sistema verifica se o leitor existe e está ativo
2. Verifica suspensões ativas do leitor
3. Verifica penalidades pendentes
4. Verifica disponibilidade do livro
5. Verifica agendamentos existentes
6. Se todas as verificações passarem, cria o empréstimo

#### Regras de Devolução

- A devolução pode ser feita a qualquer momento
- Se houver atraso, uma penalidade é gerada automaticamente
- O livro só volta a ficar disponível após a confirmação da devolução
- Se houver agendamentos pendentes, o livro é reservado automaticamente

### 2. Sistema de Penalidades

#### Geração de Penalidades

- Geradas automaticamente quando:
  1. Um empréstimo está atrasado
  2. Um livro é devolvido com atraso
  3. Um livro é devolvido danificado (geração manual)

#### Cálculo de Suspensões

- Base inicial: 0 dias
- Incremento: 1 dia por dia de atraso no pagamento
- A contagem começa após o vencimento da penalidade (7 dias após geração)
- Não há limite máximo de dias de suspensão

#### Processo de Não Pagamento

1. Dia 1: Penalidade é gerada com prazo de 7 dias para pagamento
2. Dia 8: Se não houver pagamento
   - Sistema marca a penalidade como vencida
   - Inicia contagem de dias para suspensão
3. A partir do Dia 8:
   - Cada dia sem pagamento = +1 dia de suspensão
   - A suspensão é cumulativa com outras penalidades
   - O contador só para quando a penalidade for paga
4. Exemplo:
   - Atraso de 3 dias no pagamento = 3 dias de suspensão
   - Múltiplas penalidades vencidas somam os dias de suspensão
   - Se tiver 2 penalidades vencidas há 3 dias = 6 dias de suspensão

#### Efeitos da Suspensão

- Impede novos empréstimos
- Impede novos agendamentos
- Não afeta devoluções
- Não impede o pagamento de penalidades
- A suspensão permanece mesmo após o pagamento, até cumprir os dias acumulados

### 3. Sistema de Agendamentos

#### Regras de Agendamento

- Só é possível agendar livros que:
  1. Não têm exemplares disponíveis no momento
  2. Não têm agendamento prévio do mesmo leitor
  3. O leitor não está suspenso
  4. O leitor não tem penalidades pendentes

#### Prioridade de Agendamentos

1. A fila de agendamentos é por ordem cronológica
2. Um agendamento expira após 24 horas da disponibilidade do livro
3. Se o primeiro da fila não retirar em 24h, passa para o próximo
4. Agendamentos têm prioridade sobre novos empréstimos

#### Estados de um Agendamento

1. PENDING: Aguardando disponibilidade do livro
2. AVAILABLE: Livro disponível para retirada (24h)
3. EXPIRED: Prazo de retirada expirou
4. COMPLETED: Livro foi retirado
5. CANCELLED: Agendamento foi cancelado

### 4. Gerenciamento de Acervo

#### Cadastro de Livros

- Título deve ser único dentro da biblioteca
- Quantidade disponível não pode ser negativa
- É necessário informar:
  1. Título
  2. Autor
  3. Gênero
  4. Quantidade total
  5. Ano de publicação

#### Controle de Disponibilidade

- Quantidade disponível é calculada automaticamente:
  ```
  disponível = total - emprestados
  ```
- Sistema impede empréstimo se disponível = 0
- Ao devolver, disponível é incrementado automaticamente

### 5. Serviços de Background

#### LoanMonitoringService (15 minutos)

```typescript
Verifica:
- Empréstimos com data de devolução < data atual
- Status diferente de "Returned"

Ações:
1. Gera penalidade automática
2. Valor = PENALTY_AMOUNT (configurável)
3. Prazo pagamento = 7 dias
```

#### PenalityVerificationService (24 horas)

```typescript
Verifica:
- Penalidades não pagas
- Data vencimento < data atual

Ações:
1. Para cada dia de atraso:
   - Incrementa 1 dia de suspensão
   - Atualiza status do leitor
```

#### SchedulingVerificationService (3 minutos)

```typescript
Verifica:
- Agendamentos com status AVAILABLE
- Data disponibilidade + 24h < data atual

Ações:
1. Marca agendamento como EXPIRED
2. Libera livro para próximo na fila
```

### 6. Sistema de Autenticação

#### Hierarquia de Usuários

1. Administrador do Sistema
   - Acesso total
   - Pode criar bibliotecas
   - Gerencia configurações globais

2. Biblioteca
   - Gerencia seu próprio acervo
   - Cadastra leitores
   - Gerencia empréstimos
   - Visualiza relatórios

3. Leitor
   - Visualiza acervo
   - Solicita empréstimos
   - Faz agendamentos
   - Visualiza próprio histórico

### 7. Validações e Mensagens de Erro

#### Empréstimos

```typescript
"Leitor suspenso ou não encontrado"
- Quando: leitor.isSuspended() || !leitor
- Impede: criação de empréstimo

"Livro não está disponível para empréstimo"
- Quando: book.getAvailable() <= 0
- Impede: criação de empréstimo

"Este livro já está agendado para outro leitor"
- Quando: existe agendamento pendente
- Impede: empréstimo para não agendados
```

#### Leitores

```typescript
"Este e-mail já está cadastrado"
- Quando: findByEmail retorna resultado
- Impede: criação/atualização de leitor

"Este CPF já está cadastrado"
- Quando: findByCPF retorna resultado
- Impede: criação/atualização de leitor
```

#### Penalidades

```typescript
"Não é possível fazer empréstimos com penalidades pendentes"
- Quando: leitor tem penalidades não pagas
- Impede: novos empréstimos e agendamentos
```

### 8. Exemplos de Uso

#### Criação de Empréstimo

```typescript
// 1. Verificação de penalidades
const penalities = await penalityRepository.findByReaderId(readerId);
if (penalities.some((p) => !p.paid)) {
  throw new PendingPenalitiesError();
}

// 2. Verificação de suspensão
const reader = await readerRepository.findById(readerId);
if (!reader || reader.isSuspended()) {
  throw new NotAllowedError("Leitor suspenso ou não encontrado");
}

// 3. Verificação de disponibilidade
const book = await bookRepository.findById(bookId);
if (!book || book.getAvailable() <= 0) {
  throw new NotAllowedError("Livro não disponível");
}

// 4. Verificação de agendamentos
const scheduling = await schedulingRepository.findPendingByBook(bookId);
if (scheduling && scheduling.readerId !== readerId) {
  throw new NotAllowedError("Livro agendado para outro leitor");
}
```

#### Geração de Penalidade

```typescript
// Criação automática de penalidade
const penality = new Penality({
  readerId: loan.getReaderId.toString(),
  loanId: loan.getId,
  amount: this.PENALTY_AMOUNT,
  paid: false,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
  createdAt: new Date(),
});
```

### 9. Dicas de Implementação

#### Monitoramento de Serviços

- Implemente logs detalhados nos serviços de background
- Use try-catch em todas as operações assíncronas
- Mantenha contadores de operações realizadas
- Implemente sistema de retry em caso de falhas

#### Performance

- Use índices nas colunas mais pesquisadas:
  - CPF e email de leitores
  - Título de livros
  - Status de empréstimos e agendamentos
- Implemente paginação em todas as listagens
- Cache de verificações frequentes

#### Segurança

- Sempre use hash para senhas (bcrypt)
- Implemente rate limiting nas APIs
- Valide todos os inputs
- Use tokens JWT com expiração curta

### 10. Manutenção

#### Limpeza de Dados

- Implemente soft delete em todas as entidades
- Mantenha histórico de alterações importantes
- Archive dados muito antigos
- Mantenha backups frequentes

#### Monitoramento

- Monitore tempo de resposta das APIs
- Acompanhe uso de recursos
- Implemente alertas para:
  - Falhas nos serviços de background
  - Erros frequentes
  - Uso elevado de recursos
