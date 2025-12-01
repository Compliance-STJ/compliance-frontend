import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Tempo máximo por teste */
  timeout: 30 * 1000,

  /* Configurações de expect */
  expect: {
    timeout: 5000
  },

  /* Executar testes em paralelo */
  fullyParallel: true,

  /* Falhar o build se você deixar test.only no código */
  forbidOnly: !!process.env.CI,

  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,

  /* Número de workers em CI e local */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter para ver resultados dos testes */
  reporter: 'html',

  /* Configurações compartilhadas entre todos os projetos */
  use: {
    /* URL base para usar em ações como `await page.goto('/')` */
    baseURL: 'http://localhost:4200',

    /* Coletar trace ao repetir testes falhados */
    trace: 'on-first-retry',

    /* Screenshot apenas em falhas */
    screenshot: 'only-on-failure',

    /* Vídeo apenas em falhas */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes em mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Executar servidor de desenvolvimento antes de iniciar os testes */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
