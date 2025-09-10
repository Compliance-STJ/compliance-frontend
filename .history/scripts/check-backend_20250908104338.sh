#!/usr/bin/env bash

# Script simples para checar http://localhost:8080/api/status com retries
set -euo pipefail

URL=${1:-http://localhost:8080/api/status}
TRIES=${2:-20}
SLEEP=${3:-3}

i=0
while [ $i -lt "$TRIES" ]; do
  i=$((i+1))
  echo "Checking backend: attempt $i/$TRIES -> $URL"
  if curl -fsS "$URL" >/dev/null; then
    echo "Backend is up"
    exit 0
  fi
  sleep "$SLEEP"
done

echo "Backend did not respond after $TRIES attempts"
exit 1
