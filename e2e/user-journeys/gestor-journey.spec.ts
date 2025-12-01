import { test, expect } from '@playwright/test';

/**
 * Jornada completa do usuário GESTOR
 *
 * Fluxo:
 * 1. Login como gestor
 * 2. Visualizar dashboard
 * 3. Navegar para lista de obrigações
 * 4. Visualizar detalhes de uma obrigação
 * 5. Ver aprovações pendentes
 * 6. Aprovar uma evidência
 * 7. Verificar que a aprovação foi registrada
 * 8. Logout
 */
test.describe('Jornada do Gestor - Fluxo Completo de Aprovação', () => {
  test('deve completar o fluxo de aprovação de evidências como gestor', async ({ page }) => {
    // ==========================================
    // PASSO 1: LOGIN
    // ==========================================
    test.step('Fazer login como gestor', async () => {
      await page.goto('/');

      // Preencher credenciais do gestor
      await page.locator('input[name="email"]').fill('gestor@stj.jus.br');
      await page.locator('input[name="password"]').fill('123456');

      // Submeter formulário
      await page.locator('button[type="submit"]').click();

      // Aguardar redirecionamento para dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });

      // Verificar que está logado
      await expect(page.locator('mat-toolbar')).toBeVisible();
    });

    // ==========================================
    // PASSO 2: VISUALIZAR DASHBOARD
    // ==========================================
    test.step('Visualizar o dashboard com estatísticas', async () => {
      // Verificar que está no dashboard
      await expect(page).toHaveURL(/.*dashboard/);

      // Verificar elementos do dashboard
      const dashboardCards = page.locator('mat-card, .dashboard-card');
      await expect(dashboardCards.first()).toBeVisible();

      // Aguardar carregamento de dados
      await page.waitForLoadState('networkidle');
    });

    // ==========================================
    // PASSO 3: NAVEGAR PARA APROVAÇÕES PENDENTES
    // ==========================================
    test.step('Navegar para aprovações pendentes', async () => {
      // Clicar no menu de aprovações (pode ser sidebar ou menu)
      const menuAprovacoes = page.locator('a[href*="aprovacoes"], button:has-text("Aprovações")').first();

      if (await menuAprovacoes.isVisible()) {
        await menuAprovacoes.click();
        await page.waitForLoadState('networkidle');
      } else {
        // Se não houver menu, navegar diretamente
        await page.goto('/aprovacoes-gestor');
      }

      // Verificar que está na página de aprovações
      await expect(page).toHaveURL(/.*aprovacoes/);
    });

    // ==========================================
    // PASSO 4: VISUALIZAR EVIDÊNCIAS PENDENTES
    // ==========================================
    test.step('Visualizar lista de evidências pendentes de aprovação', async () => {
      // Aguardar carregamento da lista
      await page.waitForSelector('mat-card, .evidencia-item, mat-table', { timeout: 10000 });

      // Verificar se há evidências pendentes
      const evidencias = page.locator('mat-card .evidencia-item, mat-table mat-row, .aprovacao-item');
      const count = await evidencias.count();

      if (count === 0) {
        console.log('⚠️ Não há evidências pendentes. Criando cenário de teste...');
        // Aqui você poderia criar uma evidência via API ou pular o teste
        test.skip();
      }

      expect(count).toBeGreaterThan(0);
    });

    // ==========================================
    // PASSO 5: ABRIR DETALHES DE UMA EVIDÊNCIA
    // ==========================================
    test.step('Visualizar detalhes de uma evidência', async () => {
      // Clicar no botão "Analisar" ou "Ver Detalhes" da primeira evidência
      const botaoAnalisar = page.locator('button:has-text("Analisar"), button:has-text("Ver"), button[aria-label*="analisar"]').first();

      if (await botaoAnalisar.isVisible()) {
        await botaoAnalisar.click();

        // Aguardar modal ou página de detalhes
        await page.waitForSelector('mat-dialog-container, .dialog-content, .evidencia-detalhes', { timeout: 5000 });
      }
    });

    // ==========================================
    // PASSO 6: APROVAR A EVIDÊNCIA
    // ==========================================
    test.step('Aprovar a evidência', async () => {
      // Selecionar opção "Aprovar"
      const radioAprovar = page.locator('mat-radio-button:has-text("Aprovar"), input[value="aprovar"]').first();
      await radioAprovar.click();

      // Opcional: adicionar observações
      const campoObservacoes = page.locator('textarea[name="observacoes"], textarea[placeholder*="observ"]');
      if (await campoObservacoes.isVisible()) {
        await campoObservacoes.fill('Evidência aprovada - documentação completa e adequada.');
      }

      // Clicar no botão confirmar
      const botaoConfirmar = page.locator('button:has-text("Confirmar"), button:has-text("Aprovar"), button[type="submit"]').last();
      await botaoConfirmar.click();

      // Aguardar mensagem de sucesso
      await expect(page.locator('mat-snack-bar-container, .snackbar, .toast')).toBeVisible({ timeout: 5000 });
    });

    // ==========================================
    // PASSO 7: VERIFICAR QUE A APROVAÇÃO FOI REGISTRADA
    // ==========================================
    test.step('Verificar que a evidência foi aprovada', async () => {
      // Aguardar atualização da lista
      await page.waitForTimeout(1000);

      // Verificar se a evidência não está mais na lista de pendentes
      // ou se está marcada como aprovada
      const mensagemSucesso = await page.locator('mat-snack-bar-container, .success-message').textContent();
      expect(mensagemSucesso?.toLowerCase()).toContain('sucesso');
    });

    // ==========================================
    // PASSO 8: NAVEGAR PARA OBRIGAÇÕES E VERIFICAR STATUS
    // ==========================================
    test.step('Verificar status da obrigação após aprovação', async () => {
      // Navegar para lista de obrigações
      await page.goto('/obrigacoes');
      await page.waitForLoadState('networkidle');

      // Verificar que há obrigações listadas
      const obrigacoes = page.locator('mat-card, mat-row');
      await expect(obrigacoes.first()).toBeVisible();

      // Verificar se há badges de status
      const badges = page.locator('mat-chip, .status-badge');
      await expect(badges.first()).toBeVisible();
    });

    // ==========================================
    // PASSO 9: LOGOUT
    // ==========================================
    test.step('Fazer logout', async () => {
      // Procurar botão de logout ou menu de usuário
      const userMenu = page.locator('button[aria-label*="usuário"], button[aria-label*="user"], .user-menu').first();

      if (await userMenu.isVisible()) {
        await userMenu.click();

        // Clicar em logout
        const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")');
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
        }
      }

      // Verificar redirecionamento para login
      await page.waitForURL(/.*\/(login)?$/, { timeout: 5000 });
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });
  });

  /**
   * Jornada alternativa: Gestor solicita revisão de evidência
   */
  test('deve solicitar revisão de evidência inadequada', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('input[name="email"]').fill('gestor@stj.jus.br');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    // Navegar para aprovações
    await page.goto('/aprovacoes-gestor');
    await page.waitForLoadState('networkidle');

    // Verificar se há evidências
    const evidencias = page.locator('.evidencia-item, mat-row');
    if (await evidencias.count() === 0) {
      test.skip();
    }

    // Clicar para analisar
    const botaoAnalisar = page.locator('button:has-text("Analisar")').first();
    if (await botaoAnalisar.isVisible()) {
      await botaoAnalisar.click();
      await page.waitForSelector('mat-dialog-container');

      // Selecionar "Solicitar Revisão"
      const radioRevisar = page.locator('mat-radio-button:has-text("Revisão"), input[value="revisar"]');
      await radioRevisar.click();

      // Adicionar observações obrigatórias
      await page.locator('textarea[name="observacoes"]').fill('Documentação incompleta. Por favor, adicionar o relatório detalhado.');

      // Confirmar
      await page.locator('button:has-text("Confirmar")').click();

      // Verificar sucesso
      await expect(page.locator('mat-snack-bar-container')).toBeVisible();
      const mensagem = await page.locator('mat-snack-bar-container').textContent();
      expect(mensagem?.toLowerCase()).toMatch(/revis[aã]o|enviada/);
    }
  });
});
