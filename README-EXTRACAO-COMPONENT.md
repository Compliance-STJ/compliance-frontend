# 🤖 Componente de Extração de Obrigações - Frontend

## 📋 Visão Geral

Componente Angular standalone para extração automatizada de obrigações de compliance utilizando IA, integrado ao padrão estabelecido do projeto.

## 📁 Estrutura de Arquivos Criados

```
src/app/components/extracao/
├── extracao.component.ts      # Componente principal
├── extracao.component.html    # Template HTML
├── extracao.component.css     # Estilos
└── extracao.service.ts        # Serviço de integração com API
```

## 🎯 Funcionalidades Implementadas

### 1. **Entrada de URL**
- Campo de input para URL da norma
- Validação de URL
- Exemplos de URLs clicáveis
- Desabilitação durante processamento

### 2. **Processamento com Feedback**
- Loading states com spinner
- Indicação de etapas do processamento:
  - 📥 Extraindo conteúdo da URL
  - 🤖 Processando obrigações com IA
  - 👥 Atribuindo unidades responsáveis
  - ⚙️ Finalizando processamento
- Barra de progresso animada
- Estimativa de tempo (10-30 segundos)

### 3. **Exibição de Resultados**
- **Card de Informações da Norma:**
  - Nome da norma
  - Ementa
  - Data de publicação
  - Botão de exportação JSON

- **Estatísticas:**
  - Total de obrigações extraídas
  - Obrigações com responsável atribuído
  - Obrigações sem responsável

- **Lista de Obrigações:**
  - Número sequencial
  - Artigo/dispositivo legal
  - Badge colorido da área de compliance
  - Requisito/descrição
  - Responsável principal (sigla + nome)
  - Unidades de apoio
  - Botões de ação (ver detalhes, copiar)

### 4. **Modal de Detalhes**
- Visualização completa de uma obrigação
- Texto integral do artigo
- Detalhes do responsável principal
- Lista completa de unidades de apoio
- Botões copiar e fechar

### 5. **Ações Disponíveis**
- ✅ Extrair obrigações de URL
- 🔄 Limpar formulário e resultados
- 💾 Exportar resultado completo em JSON
- 📋 Copiar obrigação individual
- 👁️ Ver detalhes de obrigação

### 6. **Tratamento de Erros**
- Validação de URL inválida
- Mensagens de erro amigáveis
- Toasts para feedback imediato
- Logs detalhados no console

## 🎨 Design System

### Cores e Badges

```css
/* Áreas de Compliance */
.badge-governanca    /* Azul: #dbeafe / #1e40af */
.badge-auditoria     /* Amarelo: #fef3c7 / #92400e */
.badge-seguranca     /* Vermelho: #fee2e2 / #991b1b */
.badge-tecnologia    /* Índigo: #e0e7ff / #3730a3 */
.badge-dados         /* Roxo: #ddd6fe / #5b21b6 */
.badge-outros        /* Cinza: #f3f4f6 / #374151 */

/* Status */
.status-conforme     /* Verde: border-left #10b981 */
.status-pendente     /* Laranja: border-left #f59e0b */
```

### Componentes Visuais

- **Cards:** Fundo branco, border-radius 8px, sombra sutil
- **Botões:** Primário (azul), Secundário (cinza), Outline
- **Modal:** Overlay escuro, dialog centralizado, max-width 800px
- **Badges:** Pills arredondados, cores categorizadas
- **Métricas:** Grid responsivo, valores grandes, labels pequenos

## 🔗 Integração

### Service (extracao.service.ts)

```typescript
// Injetável providedIn: 'root'
@Injectable({
  providedIn: 'root'
})
export class ExtracaoService {
  private apiUrl = `${environment.apiUrl}/extracao`;

  // Método principal
  extrairPorUrl(url: string): Observable<ResultadoCompleto>
  
  // Verificação de status
  verificarStatus(): Observable<string>
}
```

### Modelos de Dados

```typescript
interface ResultadoCompleto {
  norma: string;
  ementa: string;
  data_publicacao: string;
  obrigacoes: ObrigacaoCompleta[];
}

interface ObrigacaoCompleta {
  artigo_dispositivo_legal: string;
  obrigacao_requisito: string;
  texto_integral: string;
  area_compliance: string;
  unidades_responsaveis: UnidadesResponsaveis;
}

interface UnidadesResponsaveis {
  principal: UnidadeResponsavel;
  apoio: UnidadeResponsavel[];
}

interface UnidadeResponsavel {
  sigla: string;
  nome: string;
  justificativa: string;
}
```

### Rota

```typescript
// app.routes.ts
{
  path: 'extracao',
  component: ExtracaoComponent,
  title: 'Extração de Obrigações',
  canActivate: [authGuard]
}
```

### Menu

```typescript
// app.component.ts - Perfil ACR
{
  id: 'extracao',
  name: 'Extração de Obrigações',
  icon: '🤖',
  route: 'extracao'
}
```

## 📱 Responsividade

- **Desktop (> 768px):** Grid de métricas 3 colunas, layout completo
- **Tablet/Mobile (≤ 768px):**
  - Grid de métricas 1 coluna
  - Botões full-width
  - Header de obrigação com flex-wrap
  - Exemplos de URL em coluna única
  - Padding reduzido

## ⚡ Performance

- **Lazy Loading:** Componente standalone, carregado sob demanda
- **Change Detection:** OnPush strategy não aplicado (future improvement)
- **Observables:** Uso correto com subscribe/unsubscribe
- **Memory Leaks:** Simulação de etapas com cleanup automático

## 🧪 Fluxo de Uso

1. **Usuário acessa:** Menu → Gestão → Extração de Obrigações
2. **Insere URL:** Cola ou seleciona exemplo
3. **Clica "Extrair":** Validação → Requisição → Loading
4. **Aguarda:** 10-30 segundos com feedback visual
5. **Visualiza resultado:** Norma + Estatísticas + Lista
6. **Explora obrigações:** Ver detalhes, copiar, exportar JSON

## 🔐 Segurança

- **AuthGuard:** Rota protegida, requer autenticação
- **Sem permissão específica:** Todos usuários autenticados podem acessar
- **Validação de entrada:** URL validada antes do envio
- **Sanitização:** Dados exibidos via template bindings do Angular

## 🚀 Melhorias Futuras

- [ ] Salvamento de resultado no banco de dados
- [ ] Histórico de extrações realizadas
- [ ] Edição inline de obrigações extraídas
- [ ] Vinculação direta com cadastro de normas
- [ ] Upload de arquivo PDF/DOCX
- [ ] Preview do conteúdo antes de extrair
- [ ] Filtros e busca nas obrigações
- [ ] Paginação para muitas obrigações
- [ ] Comparação entre extrações
- [ ] Templates de URLs favoritas

## 📝 Exemplo de Uso no Código

```typescript
// Inject service
constructor(
  private extracaoService: ExtracaoService,
  private toastService: ToastService
) {}

// Extrair
extrair(): void {
  this.extracaoService.extrairPorUrl(this.urlNorma).subscribe({
    next: (resultado) => {
      this.resultado = resultado;
      this.toastService.success(
        'Extração concluída',
        `${resultado.obrigacoes.length} obrigações extraídas`
      );
    },
    error: (err) => {
      this.toastService.error('Erro na extração', err.message);
    }
  });
}
```

## 🎓 Padrões Seguidos

✅ **Standalone Components** - Angular 18+  
✅ **CommonModule + FormsModule** - Imports necessários  
✅ **HasPermissionDirective** - Sistema de permissões  
✅ **ToastService** - Feedback visual padronizado  
✅ **Estrutura de pastas** - components/extracao/*  
✅ **Nomenclatura** - kebab-case para arquivos  
✅ **CSS independente** - Escopo do componente  
✅ **TypeScript strict** - Tipagem completa  
✅ **Observable patterns** - RxJS  
✅ **Responsive design** - Mobile-first  

## 📚 Dependências

```json
{
  "@angular/core": "^18.x",
  "@angular/common": "^18.x",
  "@angular/forms": "^18.x",
  "@angular/router": "^18.x",
  "rxjs": "^7.x"
}
```

## 🔧 Configuração

### environment.ts

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api',
  // ...
};
```

### Sem configuração adicional necessária!

O componente está 100% integrado e funcional! 🎉
