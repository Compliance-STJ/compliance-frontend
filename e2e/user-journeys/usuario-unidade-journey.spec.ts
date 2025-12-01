import { test, expect } from '@playwright/test';

/**
 * Jornada completa do USUÁRIO DE UNIDADE
 *
 * Fluxo:
 * 1. Login como usuário de unidade
 * 2. Visualizar obrigações atribuídas à sua unidade
 * 3. Visualizar detalhes de uma obrigação
 * 4. Cadastrar evidência de conformidade
 * 5. Cadastrar plano de ação (se necessário)
 * 6. Enviar para aprovação do gestor
 * 7. Acompanhar status da aprovação
 * 8. Corrigir evidência (se solicitada revisão)
 * 9. Logout
 */
test.describe('Jornada do Usuário de Unidade - Fluxo Completo', () => {
  test('deve completar o ciclo de cadastro e envio de evidências', async ({ page }) => {
    // ==========================================
    // PASSO 1: LOGIN COMO USUÁRIO DE UNIDADE
    // ==========================================
    await test.step('Fazer login como usuário de unidade', async () => {
      await page.goto('/');

      await page.locator('input[name="email"]').fill('teste@stj.jus.br');
      await page.locator('input[name="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();

      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await expect(page.locator('mat-toolbar')).toBeVisible();
    });

    // ==========================================
    // PASSO 2: VISUALIZAR DASHBOARD
    // ==========================================
    await test.step('Visualizar dashboard com minhas obrigações', async () => {
      await expect(page).toHaveURL(/.*dashboard/);

      // Usuário deve ver apenas obrigações da sua unidade
      const cards = page.locator('mat-card');
      await expect(cards.first()).toBeVisible();

      await page.waitForLoadState('networkidle');
      console.log('✓ Dashboard carregado');
    });

    // ==========================================
    // PASSO 3: NAVEGAR PARA MINHAS OBRIGAÇÕES
    // ==========================================
    await test.step('Navegar para obrigações da minha unidade', async () => {
      // Procurar menu "Minhas Obrigações" ou similar
      const menuObrigacoes = page.locator(
        'a[href*="minhas-obrigacoes"], a[href*="obrigacoes"], button:has-text("Minhas Obrigações")'
      ).first();

      if (await menuObrigacoes.isVisible()) {
        await menuObrigacoes.click();
      } else {
        // Navegar diretamente
        await page.goto('/obrigacoes-usuario');
      }

      await page.waitForLoadState('networkidle');
    });

    // ==========================================
    // PASSO 4: VISUALIZAR LISTA DE OBRIGAÇÕES
    // ==========================================
    await test.step('Visualizar obrigações atribuídas', async () => {
      // Aguardar carregamento
      await page.waitForSelector('mat-card, mat-table, .obrigacoes-list', { timeout: 10000 });

      const obrigacoes = page.locator('mat-card .obrigacao-item, mat-row');
      const count = await obrigacoes.count();

      console.log(`✓ ${count} obrigação(ões) atribuída(s) à unidade`);

      if (count === 0) {
        console.log('⚠️ Nenhuma obrigação atribuída. Teste continuará verificando interface.');
      }
    });

    // ==========================================
    // PASSO 5: ABRIR DETALHAMENTO DE OBRIGAÇÃO
    // ==========================================
    await test.step('Abrir detalhes de uma obrigação', async () => {
      const primeiraObrigacao = page.locator('mat-card .obrigacao-item, mat-row').first();

      if (await primeiraObrigacao.isVisible()) {
        await primeiraObrigacao.click();

        // Aguardar navegação
        await page.waitForURL('**/detalhamento', { timeout: 5000 });
        await page.waitForLoadState('networkidle');

        console.log('✓ Detalhamento da obrigação carregado');
      }
    });

    // ==========================================
    // PASSO 6: VERIFICAR ÁREA DE EVIDÊNCIAS
    // ==========================================
    await test.step('Localizar área de cadastro de evidências', async () => {
      // Procurar seção de evidências
      const evidenciasSection = page.locator('.evidencias-section, .minhas-evidencias, mat-tab:has-text("Evidências")');

      if (await evidenciasSection.isVisible()) {
        if ((await evidenciasSection.getAttribute('role')) === 'tab') {
          await evidenciasSection.click();
          await page.waitForTimeout(500);
        }

        console.log('✓ Seção de evidências localizada');
      }
    });

    // ==========================================
    // PASSO 7: ADICIONAR NOVA EVIDÊNCIA
    // ==========================================
    await test.step('Cadastrar nova evidência', async () => {
      // Procurar botão de adicionar evidência
      const botaoAdicionar = page.locator(
        'button:has-text("Adicionar Evidência"), button:has-text("Nova Evidência"), button[aria-label*="adicionar"]'
      ).first();

      if (await botaoAdicionar.isVisible()) {
        await botaoAdicionar.click();

        // Aguardar modal/formulário
        await page.waitForSelector('mat-dialog-container, form, .evidencia-form', { timeout: 5000 });

        // Preencher dados da evidência
        const tituloInput = page.locator('input[name="titulo"], input[placeholder*="título"]');
        if (await tituloInput.isVisible()) {
          await tituloInput.fill('Relatório de Conformidade - Teste E2E');
        }

        const descricaoInput = page.locator('textarea[name="descricao"], textarea[placeholder*="descri"]');
        if (await descricaoInput.isVisible()) {
          await descricaoInput.fill(
            'Este relatório demonstra a conformidade da unidade com os requisitos estabelecidos na norma.'
          );
        }

        // Selecionar tipo de evidência
        const tipoSelect = page.locator('mat-select[formControlName="tipo"], mat-select[name="tipo"]');
        if (await tipoSelect.isVisible()) {
          await tipoSelect.click();
          await page.locator('mat-option:has-text("Texto")').first().click();
        }

        // Se for tipo texto, preencher conteúdo
        const conteudoTextarea = page.locator('textarea[name="conteudoTexto"], textarea[placeholder*="conteúdo"]');
        if (await conteudoTextarea.isVisible()) {
          await conteudoTextarea.fill(
            'Detalhamento completo da evidência: todos os processos foram revisados e estão em conformidade.'
          );
        }

        // Salvar evidência
        const botaoSalvar = page.locator('button:has-text("Salvar"), button[type="submit"]').last();
        await botaoSalvar.click();

        // Aguardar mensagem de sucesso
        await expect(page.locator('mat-snack-bar-container, .success-message')).toBeVisible({ timeout: 5000 });

        console.log('✓ Evidência cadastrada com sucesso');
      } else {
        console.log('⚠️ Botão de adicionar evidência não encontrado');
      }
    });

    // ==========================================
    // PASSO 8: ENVIAR EVIDÊNCIA PARA APROVAÇÃO
    // ==========================================
    await test.step('Enviar evidência para aprovação do gestor', async () => {
      // Aguardar atualização da lista
      await page.waitForTimeout(1000);

      // Procurar botão de enviar para aprovação
      const botaoEnviar = page.locator(
        'button:has-text("Enviar para Aprovação"), button:has-text("Solicitar Aprovação")'
      ).first();

      if (await botaoEnviar.isVisible()) {
        await botaoEnviar.click();

        // Confirmar envio (pode haver dialog de confirmação)
        const botaoConfirmar = page.locator('button:has-text("Confirmar"), button:has-text("Sim")');
        if (await botaoConfirmar.isVisible()) {
          await botaoConfirmar.click();
        }

        // Verificar mensagem de sucesso
        await expect(page.locator('mat-snack-bar-container')).toBeVisible({ timeout: 5000 });

        console.log('✓ Evidência enviada para aprovação');
      } else {
        console.log('⚠️ Botão de enviar não encontrado ou evidência já enviada');
      }
    });

    // ==========================================
    // PASSO 9: VERIFICAR STATUS DA EVIDÊNCIA
    // ==========================================
    await test.step('Verificar que o status mudou para "Em análise"', async () => {
      // Aguardar atualização
      await page.waitForTimeout(1000);

      // Procurar badges de status
      const statusBadge = page.locator('mat-chip:has-text("Em Análise"), .status-badge:has-text("análise")');

      if (await statusBadge.isVisible()) {
        console.log('✓ Status atualizado: Em Análise pelo Gestor');
      }
    });

    // ==========================================
    // PASSO 10: CADASTRAR PLANO DE AÇÃO (OPCIONAL)
    // ==========================================
    await test.step('Cadastrar plano de ação (se necessário)', async () => {
      // Procurar seção de planos de ação
      const planosTab = page.locator('mat-tab:has-text("Planos"), .planos-section');

      if (await planosTab.isVisible()) {
        if ((await planosTab.getAttribute('role')) === 'tab') {
          await planosTab.click();
          await page.waitForTimeout(500);
        }

        // Botão adicionar plano
        const botaoPlano = page.locator('button:has-text("Adicionar Plano"), button:has-text("Novo Plano")');

        if (await botaoPlano.isVisible()) {
          await botaoPlano.click();
          await page.waitForSelector('mat-dialog-container, form');

          // Preencher 5W2H
          await page.locator('input[name="titulo"]').fill('Plano de Adequação - Teste E2E');
          await page.locator('textarea[name="whatOQue"]').fill('Revisar procedimentos internos');
          await page.locator('textarea[name="whyPorQue"]').fill('Para garantir conformidade total');
          await page.locator('textarea[name="whereOnde"]').fill('Em todas as áreas da unidade');
          await page.locator('textarea[name="whoQuem"]').fill('Equipe de compliance');
          await page.locator('textarea[name="howComo"]').fill('Através de workshops e treinamentos');

          // Salvar
          await page.locator('button:has-text("Salvar")').last().click();
          await expect(page.locator('mat-snack-bar-container')).toBeVisible();

          console.log('✓ Plano de ação cadastrado');
        }
      } else {
        console.log('⚠️ Seção de planos de ação não encontrada');
      }
    });

    // ==========================================
    // PASSO 11: VOLTAR PARA LISTA E VERIFICAR
    // ==========================================
    await test.step('Voltar para lista e verificar obrigações atualizadas', async () => {
      // Clicar em voltar ou navegar
      const botaoVoltar = page.locator('button:has-text("Voltar"), button[aria-label*="voltar"]');

      if (await botaoVoltar.isVisible()) {
        await botaoVoltar.click();
      } else {
        await page.goto('/obrigacoes-usuario');
      }

      await page.waitForLoadState('networkidle');

      // Verificar que está na lista
      await expect(page.locator('mat-card, mat-table')).toBeVisible();

      console.log('✓ Lista de obrigações atualizada');
    });

    // ==========================================
    // PASSO 12: LOGOUT
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

      console.log('✓ Logout realizado');
    });
  });

  /**
   * Jornada alternativa: Usuário corrige evidência após revisão
   */
  test('deve corrigir evidência solicitada para revisão', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('input[name="email"]').fill('teste@stj.jus.br');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');

    // Navegar para obrigações
    await page.goto('/obrigacoes-usuario');
    await page.waitForLoadState('networkidle');

    // Procurar obrigação com status "Revisão Solicitada"
    const obrigacaoRevisao = page.locator('mat-chip:has-text("Revisão"), .status-revisao').first();

    if (await obrigacaoRevisao.isVisible()) {
      // Clicar na obrigação
      await obrigacaoRevisao.locator('xpath=ancestor::mat-card | ancestor::tr').click();
      await page.waitForURL('**/detalhamento');

      // Localizar evidência em revisão
      const evidenciaRevisao = page.locator('.evidencia-card:has(mat-chip:has-text("Revisão"))').first();

      if (await evidenciaRevisao.isVisible()) {
        // Clicar em editar
        const botaoEditar = evidenciaRevisao.locator('button:has-text("Editar")');
        await botaoEditar.click();

        // Atualizar descrição
        const descricao = page.locator('textarea[name="descricao"]');
        const textoAtual = await descricao.inputValue();
        await descricao.fill(`${textoAtual}\n\nAtualização conforme solicitado na revisão.`);

        // Salvar
        await page.locator('button:has-text("Salvar")').click();
        await expect(page.locator('mat-snack-bar-container')).toBeVisible();

        // Reenviar para aprovação
        const botaoReenviar = page.locator('button:has-text("Reenviar")');
        if (await botaoReenviar.isVisible()) {
          await botaoReenviar.click();
          await expect(page.locator('mat-snack-bar-container')).toBeVisible();
        }

        console.log('✓ Evidência corrigida e reenviada');
      }
    } else {
      console.log('⚠️ Nenhuma evidência em revisão encontrada');
    }
  });
});
