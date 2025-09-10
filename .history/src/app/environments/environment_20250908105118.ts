export const environment = {
  production: false,
  // Defina a URL da API aqui ou por variável de ambiente durante o build
  apiUrl: typeof process !== 'undefined' && process.env && process.env['API_URL'] ? process.env['API_URL'] : 'http://localhost:8080/api'
};
