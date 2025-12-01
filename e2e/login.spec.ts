import { test, expect } from '@playwright/test';

/**
 * Testes E2E para o fluxo de login
 */
test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de login antes de cada teste
    await page.goto('/');
  });

  test('deve exibir o formulário de login', async ({ page }) => {
    // Verificar se os campos de login estão visíveis
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve mostrar erro ao tentar login com credenciais vazias', async ({ page }) => {
    // Clicar no botão de login sem preencher os campos
    await page.locator('button[type="submit"]').click();

    // Verificar mensagem de erro ou validação
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('deve fazer login com sucesso com credenciais válidas', async ({ page }) => {
    // Preencher o formulário de login
    await page.locator('input[name="email"]').fill('gestor@stj.jus.br');
    await page.locator('input[name="password"]').fill('123456');

    // Clicar no botão de login
    await page.locator('button[type="submit"]').click();

    // Aguardar navegação e verificar se redirecionou para dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Verificar se o usuário está logado (verificar elemento do menu/header)
    await expect(page.locator('mat-toolbar')).toBeVisible();
  });

  test('deve mostrar erro ao tentar login com credenciais inválidas', async ({ page }) => {
    // Preencher com credenciais inválidas
    await page.locator('input[name="email"]').fill('usuario@invalido.com');
    await page.locator('input[name="password"]').fill('senhaerrada');

    // Clicar no botão de login
    await page.locator('button[type="submit"]').click();

    // Verificar mensagem de erro
    await expect(page.locator('.error-message, mat-error, .mat-error')).toBeVisible();
  });

  test('deve validar formato de email', async ({ page }) => {
    // Preencher com email inválido
    await page.locator('input[name="email"]').fill('emailinvalido');
    await page.locator('input[name="password"]').fill('senha123');
    await page.locator('button[type="submit"]').click();

    // Verificar validação de email
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) =>
      el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });
});
