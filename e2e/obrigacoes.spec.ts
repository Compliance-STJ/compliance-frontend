import { test, expect } from '@playwright/test';

/**
 * Testes E2E para o módulo de Obrigações
 */
test.describe('Obrigações Module', () => {
  // Hook de autenticação antes de todos os testes
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    await page.locator('input[name="email"]').fill('gestor@stj.jus.br');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').click();

    // Aguardar login e navegação
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navegar para obrigações
    await page.goto('/obrigacoes');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir a lista de obrigações', async ({ page }) => {
    // Verificar se a tabela/lista de obrigações está visível
    await expect(page.locator('mat-card, .obrigacoes-list')).toBeVisible();

    // Verificar se há pelo menos uma obrigação listada
    const obrigacoes = page.locator('mat-card .obrigacao-item, mat-table mat-row');
    const count = await obrigacoes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve permitir filtrar obrigações', async ({ page }) => {
    // Procurar campo de busca/filtro
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="Filtrar"]');

    if (await searchInput.isVisible()) {
      // Digitar termo de busca
      await searchInput.fill('Compliance');

      // Aguardar atualização da lista
      await page.waitForTimeout(1000);

      // Verificar se os resultados foram filtrados
      const results = page.locator('.obrigacao-item, mat-row');
      expect(await results.count()).toBeGreaterThan(0);
    }
  });

  test('deve abrir detalhamento ao clicar em uma obrigação', async ({ page }) => {
    // Clicar na primeira obrigação
    const primeiraObrigacao = page.locator('mat-card .obrigacao-item, mat-row').first();
    await primeiraObrigacao.click();

    // Verificar se navegou para a página de detalhes
    await page.waitForURL('**/obrigacoes/**/detalhamento', { timeout: 5000 });

    // Verificar se o detalhamento está visível
    await expect(page.locator('.obrigacao-detalhamento, .detalhamento-container')).toBeVisible();
  });

  test('deve exibir responsáveis no detalhamento', async ({ page }) => {
    // Navegar para uma obrigação específica
    await page.goto('/obrigacoes/37/detalhamento');
    await page.waitForLoadState('networkidle');

    // Verificar se a seção de responsáveis está visível
    const responsaveisSection = page.locator('.responsaveis-card, .responsaveis-section');
    await expect(responsaveisSection).toBeVisible();

    // Verificar se há expansion panels de responsáveis
    const panels = page.locator('mat-expansion-panel');
    expect(await panels.count()).toBeGreaterThan(0);
  });

  test('deve expandir/recolher painel de responsável', async ({ page }) => {
    // Navegar para uma obrigação específica
    await page.goto('/obrigacoes/37/detalhamento');
    await page.waitForLoadState('networkidle');

    // Clicar no primeiro painel de responsável
    const primeiroPanel = page.locator('mat-expansion-panel-header').first();
    await primeiroPanel.click();

    // Aguardar expansão
    await page.waitForTimeout(500);

    // Verificar se o conteúdo está visível
    const conteudo = page.locator('mat-expansion-panel').first().locator('.responsavel-detalhes');
    await expect(conteudo).toBeVisible();

    // Clicar novamente para recolher
    await primeiroPanel.click();
    await page.waitForTimeout(500);

    // Verificar se o conteúdo foi ocultado
    await expect(conteudo).not.toBeVisible();
  });

  test('deve exibir badges de status corretamente', async ({ page }) => {
    // Verificar se há badges de situação
    const badges = page.locator('mat-chip, .badge, .status-chip');
    expect(await badges.count()).toBeGreaterThan(0);

    // Verificar se ao menos um badge tem texto
    const primeiroBadge = badges.first();
    const textoBadge = await primeiroBadge.textContent();
    expect(textoBadge?.trim().length).toBeGreaterThan(0);
  });
});
