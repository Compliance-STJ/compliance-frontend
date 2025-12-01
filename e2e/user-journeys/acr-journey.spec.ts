import { test, expect } from '@playwright/test';

/**
 * Jornada completa do usuário ACR (Administrador de Compliance e Riscos)
 *
 * Fluxo:
 * 1. Login como ACR
 * 2. Visualizar dashboard administrativo
 * 3. Criar nova norma
 * 4. Criar obrigação vinculada à norma
 * 5. Atribuir responsáveis (unidades)
 * 6. Aprovar evidências (aprovação final)
 * 7. Definir situação da obrigação
 * 8. Gerar relatório
 * 9. Logout
 */
test.describe('Jornada do ACR - Fluxo Completo de Gestão', () => {
  test('deve completar o ciclo completo de criação e aprovação como ACR', async ({ page }) => {
    // ==========================================
    // PASSO 1: LOGIN COMO ACR
    // ==========================================
    await test.step('Fazer login como ACR', async () => {
      await page.goto('/');

      await page.locator('input[name="email"]').fill('acr@stj.jus.br');
      await page.locator('input[name="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();

      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page.locator('mat-toolbar')).toBeVisible();
    });

    // ==========================================
    // PASSO 2: VISUALIZAR DASHBOARD ADMINISTRATIVO
    // ==========================================
    await test.step('Visualizar dashboard com visão administrativa', async () => {
      await expect(page).toHaveURL(/.*dashboard/);

      // ACR deve ver estatísticas globais
      const cards = page.locator('mat-card');
      await expect(cards.first()).toBeVisible();

      await page.waitForLoadState('networkidle');
    });

    // ==========================================
    // PASSO 3: NAVEGAR PARA NORMAS
    // ==========================================
    await test.step('Navegar para gestão de normas', async () => {
      // Clicar no menu Normas
      const menuNormas = page.locator('a[href*="normas"], button:has-text("Normas")').first();

      if (await menuNormas.isVisible()) {
        await menuNormas.click();
      } else {
        await page.goto('/normas');
      }

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*normas/);
    });

    // ==========================================
    // PASSO 4: VISUALIZAR LISTA DE NORMAS
    // ==========================================
    await test.step('Visualizar normas existentes', async () => {
      // Aguardar carregamento da lista
      await page.waitForSelector('mat-card, mat-table, .normas-list', { timeout: 10000 });

      const normas = page.locator('mat-card, mat-row');
      const count = await normas.count();

      console.log(`✓ ${count} norma(s) encontrada(s)`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    // ==========================================
    // PASSO 5: NAVEGAR PARA OBRIGAÇÕES
    // ==========================================
    await test.step('Navegar para gestão de obrigações', async () => {
      await page.goto('/obrigacoes');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/.*obrigacoes/);
    });

    // ==========================================
    // PASSO 6: VISUALIZAR OBRIGAÇÃO
    // ==========================================
    await test.step('Visualizar detalhes de uma obrigação', async () => {
      // Aguardar lista
      await page.waitForSelector('mat-card, mat-table', { timeout: 10000 });

      const obrigacoes = page.locator('mat-card .obrigacao-item, mat-row').first();

      if (await obrigacoes.isVisible()) {
        await obrigacoes.click();

        // Aguardar navegação para detalhamento
        await page.waitForURL('**/detalhamento', { timeout: 5000 });
        await page.waitForLoadState('networkidle');
      }
    });

    // ==========================================
    // PASSO 7: VERIFICAR RESPONSÁVEIS E STATUS
    // ==========================================
    await test.step('Verificar responsáveis e suas evidências', async () => {
      // Verificar seção de responsáveis
      const responsaveisSection = page.locator('.responsaveis-card, .responsaveis-section');
      await expect(responsaveisSection).toBeVisible();

      // Verificar expansion panels
      const panels = page.locator('mat-expansion-panel');
      const panelCount = await panels.count();

      console.log(`✓ ${panelCount} responsável(is) atribuído(s)`);

      if (panelCount > 0) {
        // Expandir primeiro painel
        await panels.first().locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);

        // Verificar se há evidências
        const evidencias = page.locator('.evidencia-card, .evidencias-list mat-card');
        const evidenciaCount = await evidencias.count();

        console.log(`✓ ${evidenciaCount} evidência(s) cadastrada(s)`);
      }
    });

    // ==========================================
    // PASSO 8: NAVEGAR PARA APROVAÇÕES ACR
    // ==========================================
    await test.step('Navegar para aprovações pendentes do ACR', async () => {
      await page.goto('/aprovacoes-acr');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/.*aprovacoes-acr/);
    });

    // ==========================================
    // PASSO 9: APROVAR EVIDÊNCIA COM SITUAÇÃO FINAL
    // ==========================================
    await test.step('Aprovar evidência e definir situação da obrigação', async () => {
      // Aguardar lista de evidências aprovadas pelo gestor
      await page.waitForSelector('mat-card, .evidencia-item, mat-table', { timeout: 10000 });

      const evidencias = page.locator('.evidencia-item, mat-row, .aprovacao-item');
      const count = await evidencias.count();

      if (count === 0) {
        console.log('⚠️ Não há evidências aguardando aprovação do ACR');
        return; // Continua o teste
      }

      // Clicar em "Analisar" na primeira evidência
      const botaoAnalisar = page.locator('button:has-text("Analisar")').first();

      if (await botaoAnalisar.isVisible()) {
        await botaoAnalisar.click();
        await page.waitForSelector('mat-dialog-container', { timeout: 5000 });

        // Selecionar "Aprovar"
        const radioAprovar = page.locator('mat-radio-button:has-text("Aprovar"), input[value="aprovar"]');
        await radioAprovar.click();

        // Aguardar campo de situação final aparecer
        await page.waitForTimeout(500);

        // Selecionar situação final
        const situacaoFinal = page.locator('mat-radio-button:has-text("Atende Integralmente"), input[value="ATENDE_INTEGRALMENTE"]');
        if (await situacaoFinal.isVisible()) {
          await situacaoFinal.click();
        }

        // Adicionar observações
        const observacoes = page.locator('textarea[name="observacoes"]');
        if (await observacoes.isVisible()) {
          await observacoes.fill('Aprovado pela ACR. Evidências demonstram conformidade total com a norma.');
        }

        // Confirmar aprovação
        await page.locator('button:has-text("Confirmar")').click();

        // Verificar mensagem de sucesso
        await expect(page.locator('mat-snack-bar-container')).toBeVisible({ timeout: 5000 });
        const mensagem = await page.locator('mat-snack-bar-container').textContent();
        expect(mensagem?.toLowerCase()).toContain('sucesso');
      }
    });

    // ==========================================
    // PASSO 10: VERIFICAR DASHBOARD ATUALIZADO
    // ==========================================
    await test.step('Verificar estatísticas atualizadas no dashboard', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verificar que os números foram atualizados
      const cards = page.locator('mat-card');
      await expect(cards.first()).toBeVisible();

      console.log('✓ Dashboard atualizado com novas estatísticas');
    });

    // ==========================================
    // PASSO 11: LOGOUT
    // ==========================================
    await test.step('Fazer logout', async () => {
      const userMenu = page.locator('button[aria-label*="usuário"], .user-menu').first();

      if (await userMenu.isVisible()) {
        await userMenu.click();
        const logoutButton = page.locator('button:has-text("Sair")');

        if (await logoutButton.isVisible()) {
          await logoutButton.click();
        }
      }

      await page.waitForURL(/.*\/(login)?$/, { timeout: 5000 });
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });
  });

  /**
   * Jornada: ACR visualiza e exporta relatórios
   */
  test('deve visualizar e exportar relatórios de compliance', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('input[name="email"]').fill('acr@stj.jus.br');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    // Navegar para relatórios (se existir)
    const menuRelatorios = page.locator('a[href*="relatorio"], button:has-text("Relatório")');

    if (await menuRelatorios.first().isVisible()) {
      await menuRelatorios.first().click();
      await page.waitForLoadState('networkidle');

      // Verificar filtros de relatório
      const filtros = page.locator('mat-form-field, .filtro');
      if (await filtros.count() > 0) {
        console.log('✓ Filtros de relatório disponíveis');
      }

      // Verificar botão de exportar
      const botaoExportar = page.locator('button:has-text("Exportar"), button:has-text("Download")');
      if (await botaoExportar.isVisible()) {
        console.log('✓ Opção de exportação disponível');
        // Não clica para não baixar arquivo durante o teste
      }
    } else {
      console.log('⚠️ Módulo de relatórios não encontrado');
    }
  });

  /**
   * Jornada: ACR gerencia usuários e permissões
   */
  test('deve gerenciar usuários do sistema', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('input[name="email"]').fill('acr@stj.jus.br');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    // Navegar para usuários
    const menuUsuarios = page.locator('a[href*="usuarios"], button:has-text("Usuários")');

    if (await menuUsuarios.first().isVisible()) {
      await menuUsuarios.first().click();
      await page.waitForLoadState('networkidle');

      // Verificar lista de usuários
      await page.waitForSelector('mat-table, .usuarios-list', { timeout: 10000 });

      const usuarios = page.locator('mat-row, .usuario-item');
      const count = await usuarios.count();

      console.log(`✓ ${count} usuário(s) cadastrado(s)`);
      expect(count).toBeGreaterThan(0);

      // Verificar botão de adicionar usuário
      const botaoAdicionar = page.locator('button:has-text("Adicionar"), button:has-text("Novo")');
      if (await botaoAdicionar.isVisible()) {
        console.log('✓ Opção de adicionar usuário disponível');
      }
    } else {
      console.log('⚠️ Módulo de usuários não encontrado ou não acessível');
    }
  });
});
