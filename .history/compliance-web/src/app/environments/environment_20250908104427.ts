export const environment = {
  production: false,
  // Defina a URL da API aqui ou por variável de ambiente API_URL durante o build/run
  apiUrl: process.env['API_URL'] || 'http://localhost:8080/api'
};
