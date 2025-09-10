#!/bin/bash

# Script para verificar se o backend está funcionando
# Utiliza a API de status em http://localhost:8080/api/status

BACKEND_URL="http://localhost:8080/api/status"
VERBOSE=false

# Função para exibir mensagem de ajuda
show_help() {
  echo "Uso: check-backend.sh [OPÇÕES]"
  echo
  echo "Verifica se o backend da aplicação está respondendo corretamente."
  echo
  echo "Opções:"
  echo "  -u, --url URL      Define a URL da API de status (padrão: $BACKEND_URL)"
  echo "  -v, --verbose      Exibe informações detalhadas durante a execução"
  echo "  -h, --help         Exibe esta mensagem de ajuda"
  echo
  echo "Exemplos:"
  echo "  check-backend.sh"
  echo "  check-backend.sh --url http://outro-backend:8080/api/status"
  echo "  check-backend.sh --verbose"
}

# Processa argumentos da linha de comando
while [[ $# -gt 0 ]]; do
  case "$1" in
    -u|--url)
      BACKEND_URL="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $1"
      show_help
      exit 1
      ;;
  esac
done

# Exibe informações se modo verbose estiver ativado
if [ "$VERBOSE" = true ]; then
  echo "Verificando backend em: $BACKEND_URL"
  echo "Executando comando: curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL"
fi

# Verifica o status do backend
status_code=$(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL")

# Interpreta o resultado
if [ "$status_code" -eq 200 ]; then
  echo "✅ Backend está online! (Status: $status_code)"
  exit 0
else
  echo "❌ Backend está offline ou inacessível. (Status: $status_code)"
  exit 1
fi
