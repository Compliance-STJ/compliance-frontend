#!/bin/bash

# Script para testar a conexão direta com o backend
# Uso: ./scripts/test-backend-connection.sh [URL]

# URL padrão do endpoint de status
DEFAULT_URL="http://localhost:8080/api/status"
URL=${1:-$DEFAULT_URL}
FRONTEND_ORIGIN="http://localhost:4200"

echo "====================================================="
echo "Testando conexão com o backend em: $URL"
echo "====================================================="
echo ""

# Tenta uma requisição GET simples
echo "1. Teste básico (sem headers especiais):"
response=$(curl -s -o /dev/null -w "%{http_code}" $URL)
if [ "$response" = "200" ]; then
  echo "✅ Sucesso! Código de resposta: $response"
  echo "  O backend está acessível e respondendo."
else
  echo "❌ Falha! Código de resposta: $response"
  echo "  O backend pode estar offline ou bloqueando o acesso."
fi
echo ""

# Tenta com header Origin para simular requisição do frontend
echo "2. Teste com Origin do frontend ($FRONTEND_ORIGIN):"
response=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: $FRONTEND_ORIGIN" $URL)
if [ "$response" = "200" ]; then
  echo "✅ Sucesso! Código de resposta: $response"
  echo "  O backend está aceitando requisições com Origin do frontend."
else
  echo "❌ Falha! Código de resposta: $response"
  echo "  O backend está rejeitando requisições com Origin do frontend."
  echo "  Isso indica um problema de CORS que precisa ser resolvido no backend."
fi
echo ""

# Tenta com método OPTIONS para verificar preflight CORS
echo "3. Teste de preflight CORS (método OPTIONS):"
response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  $URL)
if [ "$response" = "200" ] || [ "$response" = "204" ]; then
  echo "✅ Sucesso! Código de resposta: $response"
  echo "  O backend está configurado corretamente para CORS preflight."
else
  echo "❌ Falha! Código de resposta: $response"
  echo "  O backend não está respondendo corretamente às requisições preflight CORS."
  echo "  Isso precisa ser configurado no backend para permitir requisições do frontend."
fi
echo ""

# Verifica a resposta completa com todos os headers
echo "4. Verificando resposta completa e headers CORS:"
echo "------------------------------------------------------"
curl -s -i -H "Origin: $FRONTEND_ORIGIN" $URL | grep -E '(^HTTP|Access-Control|Sistema)'
echo "------------------------------------------------------"
echo ""

echo "5. Recomendações:"
echo "------------------------------------------------------"
if [ "$response" != "200" ] && [ "$response" != "204" ]; then
  echo "❗ É necessário configurar o CORS no backend para permitir requisições do frontend."
  echo "   Verifique o arquivo scripts/backend-cors-guide.md para instruções."
else
  echo "✅ A configuração de CORS parece estar correta."
  echo "   Se ainda estiver tendo problemas, verifique:"
  echo "   - Se o backend está retornando o header 'Access-Control-Allow-Origin'"
  echo "   - Se a URL está correta no ambiente do frontend (environment.ts)"
fi
echo "------------------------------------------------------"
