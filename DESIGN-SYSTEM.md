# 🎨 Padronização de Design Corporativo - STJ Compliance

## 📋 Resumo das Mudanças

Foi implementado um sistema de design corporativo profissional e consistente para toda a aplicação STJ Compliance.

## 🎨 Paleta de Cores Corporativa

### Cores Primárias
- **Primary (Azul Institucional)**: `#1e40af` - Azul escuro confiável e profissional
- **Primary Light**: `#3b82f6` - Para hover e destaques
- **Primary Dark**: `#1e3a8a` - Para elementos de maior peso visual

### Cores Secundárias
- **Secondary**: `#64748b` - Cinza azulado para elementos secundários
- **Secondary Light**: `#94a3b8` - Para texto terciário
- **Secondary Dark**: `#475569` - Para contraste

### Cores de Status
- **Success**: `#059669` - Verde profissional (não muito saturado)
- **Warning**: `#d97706` - Laranja suave e corporativo
- **Danger**: `#dc2626` - Vermelho para ações críticas
- **Info**: `#0891b2` - Ciano para informações

### Cores de Fundo
- **Background Primary**: `#f8fafc` - Cinza muito claro para fundo geral
- **Background Secondary**: `#f1f5f9` - Variação para diferenciar áreas
- **Surface**: `#ffffff` - Branco puro para cards e superfícies

### Cores de Texto
- **Text Primary**: `#1e293b` - Texto principal (quase preto)
- **Text Secondary**: `#64748b` - Texto secundário
- **Text Tertiary**: `#94a3b8` - Texto de menor importância
- **Text Inverse**: `#ffffff` - Texto sobre fundos escuros

## 📦 Componentes Padronizados

### 1. Login Component ✅
- Removido gradiente forte de fundo
- Aplicadas cores corporativas
- Mantida elegância com design limpo

### 2. Página Inicial ✅
- Substituído fundo com gradiente azul por cinza claro
- Cards de métricas com borda lateral colorida (em vez de gradientes)
- Design mais limpo e profissional

### 3. Normas Component ✅
- Removidos efeitos de blur e transparência
- Aplicado background cinza claro
- Cards com bordas sutis e sombras leves

### 4. Origem Component ✅ (já estava padronizado anteriormente)
- Mantém o padrão atual

## 🎯 Princípios do Design Corporativo

### 1. Consistência Visual
- Mesma paleta de cores em todos os componentes
- Espaçamentos padronizados
- Tipografia uniforme

### 2. Profissionalismo
- Sem gradientes chamativos
- Cores sóbrias e corporativas
- Sombras sutis e elegantes

### 3. Hierarquia Visual Clara
- Títulos em tamanhos consistentes
- Uso apropriado de pesos de fonte
- Contraste adequado para legibilidade

### 4. Acessibilidade
- Cores com contraste suficiente (WCAG AA)
- Textos legíveis
- Feedback visual claro

## 📁 Arquivos Criados

### `/src/styles/corporate-theme.css`
Arquivo central com:
- Variáveis CSS globais
- Classes utilitárias
- Componentes reutilizáveis
- Sistema de design completo

## 🔧 Como Usar

### Importação
O tema já está importado automaticamente em `styles.css`:
```css
@import './styles/corporate-theme.css';
```

### Classes Corporativas Disponíveis

#### Containers
```html
<div class="corporate-main-content">
  <div class="corporate-header">
    <h1 class="corporate-page-title">Título</h1>
    <p class="corporate-page-subtitle">Subtítulo</p>
  </div>
</div>
```

#### Cards
```html
<div class="corporate-card">
  <div class="corporate-card-header">
    <h2 class="corporate-card-title">Título do Card</h2>
  </div>
  <div class="corporate-card-body">
    <!-- Conteúdo -->
  </div>
</div>
```

#### Botões
```html
<button class="corporate-btn corporate-btn-primary">Primary</button>
<button class="corporate-btn corporate-btn-secondary">Secondary</button>
<button class="corporate-btn corporate-btn-success">Success</button>
<button class="corporate-btn corporate-btn-danger">Danger</button>
```

#### Formulários
```html
<label class="corporate-form-label">Nome</label>
<input type="text" class="corporate-form-input">
<select class="corporate-form-select">...</select>
<textarea class="corporate-form-textarea"></textarea>
```

#### Badges/Status
```html
<span class="corporate-badge corporate-badge-success">Ativo</span>
<span class="corporate-badge corporate-badge-warning">Pendente</span>
<span class="corporate-badge corporate-badge-danger">Inativo</span>
```

#### Alerts
```html
<div class="corporate-alert corporate-alert-success">Sucesso!</div>
<div class="corporate-alert corporate-alert-warning">Atenção!</div>
<div class="corporate-alert corporate-alert-danger">Erro!</div>
<div class="corporate-alert corporate-alert-info">Informação</div>
```

#### Métricas
```html
<div class="corporate-metric-card">
  <div class="corporate-metric-value">1,234</div>
  <div class="corporate-metric-label">Total de Normas</div>
</div>
```

## 🚀 Próximos Componentes a Padronizar

### Alta Prioridade
1. **Obrigações Component** - Aplicar classes corporativas
2. **Unidades Component** - Padronizar cores e espaçamentos
3. **Extração Component** - Remover inconsistências visuais

### Média Prioridade
4. **Obrigatoriedade Component** - Ajustar para o padrão
5. **Situação Norma Component** - Melhorar visual
6. **Situação Obrigação Component** - Atualizar cores

### Baixa Prioridade
7. **Dialog Component** - Verificar consistência
8. **Toast Component** - Ajustar cores de notificação
9. **User Header Component** - Padronizar com tema

## 📊 Benefícios Implementados

✅ **Consistência**: Design uniforme em toda aplicação
✅ **Profissionalismo**: Visual corporativo adequado ao STJ
✅ **Manutenibilidade**: Variáveis CSS centralizadas
✅ **Escalabilidade**: Fácil adicionar novos componentes
✅ **Acessibilidade**: Cores com contraste adequado
✅ **Performance**: CSS otimizado e sem redundâncias

## 🎓 Boas Práticas Aplicadas

1. **DRY (Don't Repeat Yourself)**: Classes reutilizáveis
2. **Semantic CSS**: Nomes descritivos e claros
3. **Mobile First**: Design responsivo
4. **Performance**: Seletores eficientes
5. **Accessibility**: ARIA-friendly colors

## 📝 Notas Importantes

- Todas as cores anteriores foram substituídas pelas corporativas
- Gradientes chamativos foram removidos
- Efeitos de blur e transparência foram eliminados
- Sombras foram suavizadas para um visual mais profissional
- Espaçamentos foram padronizados

## 🔄 Status da Padronização

| Componente | Status | Prioridade |
|-----------|--------|-----------|
| Login | ✅ Completo | Alta |
| Página Inicial | ✅ Completo | Alta |
| Normas | ✅ Completo | Alta |
| Origem | ✅ Completo | Alta |
| Obrigações | 🔄 Pendente | Alta |
| Unidades | 🔄 Pendente | Alta |
| Extração | 🔄 Pendente | Média |
| Obrigatoriedade | 🔄 Pendente | Média |
| Outros | 🔄 Pendente | Baixa |

## 💡 Recomendações

1. Sempre use as variáveis CSS (`var(--primary)`) em vez de cores hard-coded
2. Prefira classes corporativas quando possível
3. Mantenha consistência de espaçamentos usando variáveis
4. Teste em diferentes resoluções
5. Verifique contraste de cores (acessibilidade)

---

**Data de Implementação**: 13 de outubro de 2025
**Versão**: 1.0
**Status**: Em Progresso
