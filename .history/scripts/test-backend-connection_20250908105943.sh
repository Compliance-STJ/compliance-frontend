#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verificando conexão com o backend...${NC}"

# URL do backend
BACKEND_URL="http://localhost:8080/api/status"

# Tenta fazer uma requisição para o backend
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao conectar ao backend. Verifique se o servidor está rodando.${NC}"
    exit 1
fi

if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}Conexão com o backend estabelecida com sucesso! (Status: $STATUS)${NC}"
    
    # Mostra o conteúdo da resposta
    RESPONSE=$(curl -s $BACKEND_URL)
    echo -e "${GREEN}Resposta do backend: $RESPONSE${NC}"
    
    # Verifica se o proxy está configurado corretamente
    echo -e "${YELLOW}Verificando configuração do proxy...${NC}"
    if [ -f "proxy.conf.json" ]; then
        echo -e "${GREEN}Arquivo proxy.conf.json encontrado.${NC}"
        cat proxy.conf.json
    else
        echo -e "${RED}Arquivo proxy.conf.json não encontrado.${NC}"
    fi
    
    echo -e "${YELLOW}Verificando angular.json...${NC}"
    grep -A 5 "proxyConfig" angular.json || echo -e "${RED}proxyConfig não encontrado em angular.json${NC}"
    
else
    echo -e "${RED}Falha ao conectar ao backend. Status: $STATUS${NC}"
    echo -e "${YELLOW}Tentando acessar o backend sem o prefixo /api...${NC}"
    
    # Tenta sem o prefixo /api
    BACKEND_URL_NO_API="http://localhost:8080/status"
    STATUS_NO_API=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL_NO_API)
    
    if [ "$STATUS_NO_API" = "200" ]; then
        echo -e "${GREEN}Conexão estabelecida sem o prefixo /api! (Status: $STATUS_NO_API)${NC}"
        echo -e "${YELLOW}Você deve atualizar seu arquivo environment.ts para usar: apiUrl: 'http://localhost:8080'${NC}"
        
        # Mostra o conteúdo da resposta
        RESPONSE=$(curl -s $BACKEND_URL_NO_API)
        echo -e "${GREEN}Resposta do backend: $RESPONSE${NC}"
    else
        echo -e "${RED}Também falhou sem o prefixo /api. Status: $STATUS_NO_API${NC}"
        echo -e "${YELLOW}Verificando se o backend está rodando...${NC}"
        netstat -tulpn 2>/dev/null | grep 8080 || echo -e "${RED}Nenhum serviço encontrado na porta 8080${NC}"
    fi
fi

echo -e "${YELLOW}Verificando configurações CORS no frontend...${NC}"
grep -r "HttpClient" --include="*.ts" src/ | head -5
