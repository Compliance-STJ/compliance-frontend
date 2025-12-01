import { test, expect } from '@playwright/test';

/**
 * Teste de diagnóstico para identificar os seletores corretos da página de login
 */
test('diagnosticar página de login', async ({ page }) => {
  // Navegar para a página
  await page.goto('/');

  // Aguardar carregamento
  await page.waitForLoadState('networkidle');

  // Tirar screenshot para ver a página
  await page.screenshot({ path: 'login-diagnostico.png', fullPage: true });

  // Tentar encontrar o formulário
  console.log('=== DIAGNÓSTICO DA PÁGINA DE LOGIN ===');

  // Buscar todos os inputs
  const inputs = await page.locator('input').all();
  console.log(`\nTotal de inputs encontrados: ${inputs.length}`);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const formControlName = await input.getAttribute('formControlName');

    console.log(`\nInput ${i + 1}:`);
    console.log(`  type: ${type}`);
    console.log(`  name: ${name}`);
    console.log(`  id: ${id}`);
    console.log(`  placeholder: ${placeholder}`);
    console.log(`  formControlName: ${formControlName}`);
  }

  // Buscar todos os buttons
  const buttons = await page.locator('button').all();
  console.log(`\n\nTotal de buttons encontrados: ${buttons.length}`);

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const type = await button.getAttribute('type');
    const text = await button.textContent();

    console.log(`\nButton ${i + 1}:`);
    console.log(`  type: ${type}`);
    console.log(`  text: ${text?.trim()}`);
  }

  // Imprimir o HTML do body para análise
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\n\n=== HTML DA PÁGINA ===');
  console.log(bodyHTML.substring(0, 2000)); // Primeiros 2000 caracteres
});
