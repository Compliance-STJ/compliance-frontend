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

# Verificar se a imagem do backend existe localmente
echo "🔍 Verificando disponibilidade da imagem local do backend..."
if ! docker image inspect compliance-backend:latest > /dev/null 2>&1; then
  echo "⚠️ Imagem local 'compliance-backend:latest' não encontrada."
  
  # Verificar se o repositório do backend existe
  if [ -d "../compliance-backend" ]; then
    echo "🔄 Construindo imagem do backend a partir do repositório local..."
    
    # Entrar no diretório do backend e construir a imagem
    (cd ../compliance-backend && docker build -t compliance-backend:latest .)
    
    if [ $? -ne 0 ]; then
      echo "❌ Falha ao construir a imagem do backend."
      exit 1
    fi
    
    echo "✅ Imagem do backend construída com sucesso!"
  else
    echo "❌ Repositório do backend não encontrado em '../compliance-backend'."
    echo "Por favor, clone o repositório do backend na pasta pai ou ajuste o docker-compose.yml."
    exit 1
  fi
fi

# Iniciar os serviços
echo "🚀 Iniciando todos os serviços com docker-compose..."
docker-compose up
