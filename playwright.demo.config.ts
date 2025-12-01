import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração DEMO do Playwright
 *
 * Esta configuração executa os testes em MODO DEMONSTRAÇÃO:
 * - Uma única janela do navegador
 * - Execução serial (um teste por vez)
 * - Navegador visível
 * - Velocidade reduzida para facilitar visualização
 * - Apenas Chrome/Chromium
 *
 * USO: npm run test:e2e:demo
 */
export default defineConfig({
  testDir: './e2e',

  /* Tempo máximo por teste (aumentado para demo) */
  timeout: 120 * 1000, // 2 minutos

  /* Configurações de expect */
  expect: {
    timeout: 10000 // 10 segundos
  },

  /* DESABILITAR paralelismo - execução SERIAL */
  fullyParallel: false,

  /* Apenas 1 worker - UMA janela por vez */
  workers: 1,

  /* Não falhar em test.only (útil para testar um fluxo específico) */
  forbidOnly: false,

  /* Sem retry - queremos ver falhas imediatamente */
  retries: 0,

  /* Reporter inline para ver progresso em tempo real */
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  /* Configurações compartilhadas */
  use: {
    baseURL: 'http://localhost:4200',

    /* Sempre capturar trace */
    trace: 'on',

    /* Sempre tirar screenshots */
    screenshot: 'on',

    /* Sempre gravar vídeo */
    video: 'on',

    /* MODO LENTO - para visualizar melhor */
    launchOptions: {
      slowMo: 500, // 500ms de delay entre ações
    },

    /* Configurações de navegação */
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },

  /* APENAS Chromium em modo visível */
  projects: [
    {
      name: 'demo',
      use: {
        ...devices['Desktop Chrome'],

        /* Navegador VISÍVEL */
        headless: false,

        /* Janela maximizada */
        viewport: { width: 1920, height: 1080 },

        /* DevTools abertas (opcional) */
        // devtools: true,
      },
    },
  ],

  /* Executar servidor de desenvolvimento */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: true, // Reutilizar se já estiver rodando
    timeout: 120 * 1000,
  },
});
