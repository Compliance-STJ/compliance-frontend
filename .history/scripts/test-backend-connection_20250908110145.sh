#!/bin/bash

# Script para testar a conexão com o backend e verificar problemas de CORS
# Uso: ./scripts/test-backend-connection.sh [URL]

# URL padrão do endpoint de status
DEFAULT_URL="http://localhost:8080/api/status"
URL=${1:-$DEFAULT_URL}

echo "Testando conexão com o backend em: $URL"
echo "------------------------------------"

# Testa conexão básica
echo "1. Teste básico de conexão:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$URL"
echo ""

# Testa com headers de CORS
echo "2. Teste com headers de CORS (simulando navegador):"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS "$URL"
echo ""

# Testa resposta real
echo "3. Conteúdo da resposta:"
curl -s "$URL"
echo -e "\n"

# Verifica se o proxy está configurado
echo "4. Verificação da configuração de proxy:"
if grep -q "proxyConfig" angular.json; then
  echo "✓ proxyConfig encontrado em angular.json"
else
  echo "✗ proxyConfig NÃO encontrado em angular.json"
fi

if [ -f "proxy.conf.json" ]; then
  echo "✓ arquivo proxy.conf.json encontrado"
  cat proxy.conf.json
else
  echo "✗ arquivo proxy.conf.json NÃO encontrado"
fi
echo ""

echo "5. Recomendações:"
echo "- Se os testes 1 e 3 funcionam mas o frontend não consegue conectar,"
echo "  provavelmente é um problema de CORS."
echo "- Certifique-se que o proxy está configurado corretamente no Angular"
echo "- Ou configure o backend para permitir CORS com:"
echo "  Access-Control-Allow-Origin: http://localhost:4200"
echo "- Outra opção é usar 'ng serve --proxy-config proxy.conf.json'"
