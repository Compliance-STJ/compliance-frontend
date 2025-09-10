#!/bin/bash

# Script para verificar e resolver problemas de CORS com o backend
# Uso: ./scripts/fix-cors.sh [URL_BACKEND]

BACKEND_URL=${1:-"http://localhost:8080"}
CORS_TEST_ENDPOINT="${BACKEND_URL}/api/status"
FRONTEND_URL="http://localhost:4200"

echo "===== Diagnóstico de CORS para API ====="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Endpoint de teste: $CORS_TEST_ENDPOINT"
echo "--------------------------------------"

# Testa a configuração atual de CORS
echo "Testando configuração atual de CORS..."
PREFLIGHT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  $CORS_TEST_ENDPOINT)

echo "Resposta do preflight: $PREFLIGHT_RESPONSE"

if [ "$PREFLIGHT_RESPONSE" = "200" ] || [ "$PREFLIGHT_RESPONSE" = "204" ]; then
  echo "✓ O servidor backend está configurado corretamente para CORS"
else
  echo "✗ O servidor backend não está configurado corretamente para CORS"
  
  echo -e "\nRecomendações para resolver o problema de CORS:"
  echo "1. Preferível: Use o proxy Angular para desenvolvimento:"
  echo "   - Certifique-se que o arquivo proxy.conf.json está configurado:"
  echo "     {
  \"/api\": {
    \"target\": \"$BACKEND_URL\",
    \"secure\": false,
    \"changeOrigin\": true
  }
}"
  echo "   - Execute com: ng serve --proxy-config proxy.conf.json"
  
  echo -e "\n2. Alternativa: Configure o backend para permitir CORS:"
  echo "   Se você tem acesso ao código do backend, adicione os seguintes headers:"
  echo "   - Access-Control-Allow-Origin: $FRONTEND_URL"
  echo "   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"
  echo "   - Access-Control-Allow-Headers: Origin, Content-Type, Accept"
  
  echo -e "\n3. Temporário: Use uma extensão de navegador para desabilitar CORS:"
  echo "   - Para Firefox: CORS Everywhere"
  echo "   - Para Chrome: CORS Unblock"
  echo "   ATENÇÃO: Use apenas para desenvolvimento, nunca em produção!"
fi

echo -e "\n===== Verificação do Proxy Angular ====="
if [ -f "proxy.conf.json" ]; then
  echo "✓ Arquivo proxy.conf.json encontrado"
  echo "Conteúdo:"
  cat proxy.conf.json
else
  echo "✗ Arquivo proxy.conf.json não encontrado"
  echo "Criando arquivo proxy.conf.json recomendado..."
  
  echo '{
  "/api": {
    "target": "'$BACKEND_URL'",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}' > proxy.conf.json
  
  echo "✓ Arquivo proxy.conf.json criado"
fi

if grep -q "proxyConfig" angular.json; then
  echo "✓ Angular está configurado para usar proxy"
else
  echo "✗ Angular não está configurado para usar proxy"
  echo "Por favor, adicione a seguinte configuração ao seu angular.json:"
  echo '"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}'
fi

echo -e "\n===== Próximos Passos ====="
echo "1. Execute 'ng serve' para iniciar o Angular com o proxy configurado"
echo "2. Tente verificar o status do backend novamente"
echo "3. Se ainda houver problemas, tente o script de diagnóstico:"
echo "   ./scripts/test-backend-connection.sh"
