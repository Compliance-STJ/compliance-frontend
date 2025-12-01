# 🎬 Modo Demonstração - Visualização dos Testes

Este guia explica como executar os testes E2E em **modo demonstração**, onde você pode ver o navegador executando os testes em uma única janela, como se fosse um usuário real navegando.

## 🎯 O Que É o Modo Demo?

O modo demo executa os testes com as seguintes características:

- ✅ **Uma única janela de navegador** (não abre múltiplas instâncias)
- ✅ **Navegador visível** (não headless)
- ✅ **Execução serial** (um teste por vez, em sequência)
- ✅ **Velocidade reduzida** (500ms entre ações para visualizar melhor)
- ✅ **Janela maximizada** (1920x1080)
- ✅ **Gravação completa** (vídeo e screenshots)

## 🚀 Como Usar

### Pré-requisito: Frontend rodando

Certifique-se de que o frontend está rodando em `http://localhost:4200`:

```bash
# Em um terminal separado
npm start
```

### Executar Todos os Testes de Jornada (Demo)

```bash
npm run test:e2e:demo
```

Isso executará **todas** as jornadas em sequência na mesma janela do navegador.

### Executar Jornada Específica

#### Ver apenas a jornada do Gestor
```bash
npm run test:e2e:demo:gestor
```

Você verá:
1. Login como gestor
2. Navegação pelo dashboard
3. Aprovação de evidências
4. Logout

#### Ver apenas a jornada do ACR
```bash
npm run test:e2e:demo:acr
```

Você verá:
1. Login como ACR
2. Visualização de normas e obrigações
3. Aprovação final de evidências
4. Logout

#### Ver apenas a jornada do Usuário de Unidade
```bash
npm run test:e2e:demo:usuario
```

Você verá:
1. Login como usuário
2. Visualização de obrigações
3. Cadastro de evidências
4. Cadastro de planos de ação
5. Envio para aprovação
6. Logout

#### Ver o Ciclo Completo
```bash
npm run test:e2e:demo:completo
```

Você verá **TODO O FLUXO**:
1. ACR criando/selecionando obrigação
2. Usuário cadastrando evidência
3. Gestor aprovando
4. ACR fazendo aprovação final

## ⚙️ Personalização

### Ajustar a Velocidade

Edite o arquivo [`playwright.demo.config.ts`](../../playwright.demo.config.ts):

```typescript
launchOptions: {
  slowMo: 500,  // Altere este valor
}
```

Valores sugeridos:
- `slowMo: 0` - Execução normal (rápida)
- `slowMo: 300` - Um pouco lento
- `slowMo: 500` - Moderado (padrão)
- `slowMo: 1000` - Bem lento (bom para apresentações)
- `slowMo: 2000` - Muito lento (debug detalhado)

### Executar Apenas Um Teste Específico

Use `.only` no código do teste:

```typescript
// Em gestor-journey.spec.ts
test.only('deve completar o fluxo de aprovação', async ({ page }) => {
  // ...
});
```

Depois execute:
```bash
npm run test:e2e:demo:gestor
```

### Abilitar DevTools

Edite `playwright.demo.config.ts` e descomente:

```typescript
devtools: true,
```

## 📹 Gravações

Todos os testes em modo demo são gravados automaticamente:

- **Vídeos**: `test-results/*/video.webm`
- **Screenshots**: `test-results/*/screenshots/`
- **Trace**: `test-results/*/trace.zip`

Para ver o trace detalhado:
```bash
npx playwright show-trace test-results/.../trace.zip
```

## 🎥 Apresentando para Stakeholders

### Cenário: Demonstrar o sistema funcionando

1. **Prepare o ambiente**:
   ```bash
   # Terminal 1: Inicie o frontend
   npm start

   # Terminal 2: Execute os testes
   npm run test:e2e:demo
   ```

2. **Projete a tela** onde o navegador abrirá

3. **Deixe executar** - os testes mostrarão todos os fluxos automaticamente

### Cenário: Apresentar apenas um fluxo específico

```bash
# Mostrar apenas como o gestor aprova evidências
npm run test:e2e:demo:gestor
```

## 🐛 Troubleshooting

### O navegador fecha muito rápido

Adicione um delay no final do teste:

```typescript
await test.step('Pausar para visualização', async () => {
  await page.waitForTimeout(3000); // 3 segundos
});
```

### Múltiplas janelas ainda estão abrindo

Certifique-se de estar usando o comando correto:
```bash
# ✅ Correto (modo demo)
npm run test:e2e:demo

# ❌ Errado (modo normal com paralelismo)
npm run test:e2e
```

### Testes falhando por timeout

Aumente o timeout em `playwright.demo.config.ts`:

```typescript
timeout: 180 * 1000, // 3 minutos
```

### Navegador não abre

Verifique se o Chromium está instalado:
```bash
npx playwright install chromium
```

## 📊 Comparação de Modos

| Modo | Comando | Navegador Visível | Paralelismo | Velocidade | Uso |
|------|---------|-------------------|-------------|------------|-----|
| **Normal** | `npm run test:e2e` | ❌ Não | ✅ Sim | 🚀 Rápido | CI/CD, testes rápidos |
| **Headed** | `npm run test:e2e:headed` | ✅ Sim | ✅ Sim | 🚀 Rápido | Debug múltiplos testes |
| **Demo** | `npm run test:e2e:demo` | ✅ Sim | ❌ Não | 🐌 Lento | **Apresentações, demonstrações** |
| **Debug** | `npm run test:e2e:debug` | ✅ Sim | ❌ Não | ⏸️ Pausado | Debug linha por linha |
| **UI** | `npm run test:e2e:ui` | ✅ Interface | ❌ Não | 🎮 Interativo | Exploração e desenvolvimento |

## 💡 Dicas

1. **Use o modo demo** para:
   - Apresentar o sistema para stakeholders
   - Criar vídeos demonstrativos
   - Validar visualmente os fluxos
   - Treinamento de novos usuários

2. **Use o modo normal** para:
   - Execução rápida em CI/CD
   - Validação antes de commits
   - Testes de regressão

3. **Use o modo UI** para:
   - Desenvolver novos testes
   - Investigar falhas
   - Explorar seletores

---

**Pronto para começar?**

```bash
npm run test:e2e:demo:gestor
```

Sente-se e assista o sistema sendo testado automaticamente! 🍿
