#!/bin/bash

# Script para iniciar o ambiente completo do Compliance System

echo "🚀 Iniciando ambiente completo do Compliance System..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando. Tentando iniciar o serviço..."
  
  # Tentar iniciar o Docker (diferentes abordagens dependendo do sistema)
  if [ -x "$(command -v systemctl)" ]; then
    sudo systemctl start docker
  elif [ -x "$(command -v service)" ]; then
    sudo service docker start
  else
    echo "❌ Não foi possível iniciar o Docker automaticamente. Por favor, inicie o Docker manualmente."
    exit 1
  fi
  
  # Verificar novamente
  if ! docker info > /dev/null 2>&1; then
    echo "❌ Falha ao iniciar o Docker. Por favor, verifique sua instalação."
    exit 1
  fi
  
  echo "✅ Docker iniciado com sucesso!"
fi

# Verificar se a imagem do backend existe no registry
echo "🔍 Verificando disponibilidade da imagem do backend..."
if ! docker pull ghcr.io/compliance-stj/compliance-backend:latest > /dev/null 2>&1; then
  echo "⚠️ Imagem do backend não encontrada no GitHub Container Registry."
  echo "🔄 Usando fallback para build local..."
  
  # Modificar temporariamente o docker-compose para usar build em vez de image
  sed -i.bak 's|image: ghcr.io/compliance-stj/compliance-backend:latest|build: ../compliance-backend/compliance-app|' docker-compose.yml
  RESTORE_COMPOSE=true
fi

# Iniciar os serviços
echo "🚀 Iniciando todos os serviços com docker-compose..."
docker-compose up

# Restaurar o docker-compose original se foi modificado
if [ "$RESTORE_COMPOSE" = true ]; then
  mv docker-compose.yml.bak docker-compose.yml
fi
