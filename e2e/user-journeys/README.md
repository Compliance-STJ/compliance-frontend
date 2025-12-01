# Testes de Jornada de Usuário (User Journey Tests)

Este diretório contém testes E2E que simulam os **fluxos completos de uso** do Sistema de Compliance STJ, seguindo o caminho real que cada tipo de usuário percorre na aplicação.

## 📋 Filosofia dos Testes de Jornada

Ao contrário dos testes unitários ou de componentes isolados, os **testes de jornada** validam:

- ✅ Fluxos completos do início ao fim
- ✅ Interações entre diferentes módulos
- ✅ Experiência real do usuário
- ✅ Integração entre frontend e backend
- ✅ Navegação e transições de estado
- ✅ Permissões e controle de acesso

## 🎭 Perfis de Usuário

### 1. **ACR (Administrador de Compliance e Riscos)**
- Arquivo: [`acr-journey.spec.ts`](./acr-journey.spec.ts)
- **Responsabilidades**:
  - Criar normas e obrigações
  - Atribuir responsáveis
  - Fazer aprovação final
  - Definir situação das obrigações
  - Gerar relatórios
  - Gerenciar usuários

**Fluxos testados**:
- Ciclo completo de criação e aprovação
- Visualização e exportação de relatórios
- Gerenciamento de usuários

### 2. **Gestor**
- Arquivo: [`gestor-journey.spec.ts`](./gestor-journey.spec.ts)
- **Responsabilidades**:
  - Visualizar dashboard de aprovações
  - Analisar evidências
  - Aprovar ou solicitar revisão
  - Acompanhar obrigações

**Fluxos testados**:
- Fluxo completo de aprovação de evidências
- Solicitação de revisão de evidência inadequada

### 3. **Usuário de Unidade**
- Arquivo: [`usuario-unidade-journey.spec.ts`](./usuario-unidade-journey.spec.ts)
- **Responsabilidades**:
  - Visualizar obrigações atribuídas
  - Cadastrar evidências
  - Cadastrar planos de ação
  - Enviar para aprovação
  - Corrigir evidências revisadas

**Fluxos testados**:
- Ciclo completo de cadastro e envio de evidências
- Correção de evidência após revisão

### 4. **Ciclo Completo**
- Arquivo: [`ciclo-completo.spec.ts`](./ciclo-completo.spec.ts)
- **Fluxo integrado** que passa por todos os perfis:
  1. ACR cria obrigação e atribui responsável
  2. Usuário cadastra evidência e envia
  3. Gestor analisa e aprova
  4. ACR faz aprovação final
  5. Verificação do status final

## 🚀 Como Executar

### Executar todos os testes de jornada
```bash
npm run test:e2e -- user-journeys/
```

### Executar jornada específica
```bash
# Apenas ACR
npm run test:e2e -- user-journeys/acr-journey.spec.ts

# Apenas Gestor
npm run test:e2e -- user-journeys/gestor-journey.spec.ts

# Apenas Usuário de Unidade
npm run test:e2e -- user-journeys/usuario-unidade-journey.spec.ts

# Ciclo completo
npm run test:e2e -- user-journeys/ciclo-completo.spec.ts
```

### Executar com interface visual
```bash
npm run test:e2e:ui -- user-journeys/
```

### Executar em modo debug
```bash
npm run test:e2e:debug -- user-journeys/gestor-journey.spec.ts
```

### Executar com navegador visível
```bash
npm run test:e2e:headed -- user-journeys/
```

## 📊 Estrutura dos Testes

Cada teste de jornada segue esta estrutura:

```typescript
test.describe('Jornada do [Perfil]', () => {
  test('deve completar o fluxo [descrição]', async ({ page }) => {
    // Fase 1: Login
    await test.step('Fazer login', async () => { /* ... */ });

    // Fase 2: Navegação
    await test.step('Navegar para módulo', async () => { /* ... */ });

    // Fase 3: Ação principal
    await test.step('Executar ação', async () => { /* ... */ });

    // Fase N: Verificação
    await test.step('Verificar resultado', async () => { /* ... */ });

    // Fase final: Logout
    await test.step('Fazer logout', async () => { /* ... */ });
  });
});
```

## 🎯 Vantagens dos Testes por Steps

O uso de `test.step()` oferece:

1. **Rastreabilidade**: Cada step aparece no relatório
2. **Debug facilitado**: Saber exatamente onde falhou
3. **Documentação viva**: Steps descrevem o fluxo
4. **Screenshots organizados**: Um por step em caso de falha

## ⚙️ Configuração

### Credenciais de Teste

Os testes usam as seguintes credenciais (definidas no banco de dados de teste):

```typescript
// ACR
email: 'acr@stj.jus.br'
password: '123456'

// Gestor
email: 'gestor@stj.jus.br'
password: '123456'

// Usuário de Unidade
email: 'teste@stj.jus.br'
password: '123456'
```

### Pré-requisitos

1. **Backend rodando**: `http://localhost:8080`
2. **Frontend rodando**: `http://localhost:4200`
3. **Banco de dados com dados de teste**

## 📝 Boas Práticas

### 1. Independência dos Testes
Cada teste deve ser independente e não depender de dados criados por outros testes.

```typescript
// ❌ Ruim - depende de teste anterior
test('deve editar obrigação criada no teste anterior', async ({ page }) => {
  // ...
});

// ✅ Bom - cria seus próprios dados ou usa dados fixos
test('deve editar obrigação', async ({ page }) => {
  // Criar obrigação OU usar ID conhecido
  // ...
});
```

### 2. Tratamento de Casos Opcionais
Use verificações condicionais para elementos que podem não existir:

```typescript
const botao = page.locator('button:has-text("Adicionar")');
if (await botao.isVisible()) {
  await botao.click();
} else {
  console.log('⚠️ Botão não encontrado - funcionalidade pode não estar implementada');
}
```

### 3. Aguardar Carregamentos
Sempre aguarde elementos e estados:

```typescript
// Aguardar navegação
await page.waitForURL('**/dashboard');

// Aguardar elemento
await page.waitForSelector('mat-table', { timeout: 10000 });

// Aguardar network idle
await page.waitForLoadState('networkidle');
```

### 4. Mensagens Informativas
Use `console.log()` para documentar o progresso:

```typescript
console.log('✓ Login realizado com sucesso');
console.log(`✓ ${count} evidências encontradas`);
console.log('⚠️ Nenhum dado disponível para teste');
```

## 🐛 Troubleshooting

### Timeout em steps
Se um step específico demora muito:

```typescript
await test.step('Passo demorado', async () => {
  await page.waitForSelector('selector', { timeout: 30000 }); // 30 segundos
});
```

### Elementos não encontrados
Verifique se o seletor está correto:

```typescript
// Múltiplas opções de seletor
const elemento = page.locator(
  'button:has-text("Salvar"), button[type="submit"], .btn-save'
).first();
```

### Dados não disponíveis
Os testes lidam graciosamente com ausência de dados:

```typescript
if (count === 0) {
  console.log('⚠️ Sem dados - pulando validação');
  return; // Ou test.skip()
}
```

## 📈 Relatórios

Após executar os testes, visualize o relatório:

```bash
npm run test:e2e:report
```

O relatório mostra:
- ✅ Testes passados
- ❌ Testes falhados
- ⏱️ Tempo de execução de cada step
- 📸 Screenshots de falhas
- 🎥 Vídeos (se configurado)
- 📊 Trace de execução

## 🔄 CI/CD

Para executar em pipeline:

```yaml
- name: Run User Journey Tests
  run: |
    npm run test:e2e -- user-journeys/
  env:
    CI: true
```

## 📚 Referências

- [Playwright Test Steps](https://playwright.dev/docs/api/class-test#test-step)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Última atualização**: Dezembro 2025
