#!/bin/bash
# Ruhrgutachten Landing — Deploy Script
# Triggered by GitHub Actions webhook
set -euo pipefail

PROJECT_DIR="/opt/hermes/web/ruhrgutachten-premium"
DIST_DIR="$PROJECT_DIR/dist"
WEBHOOK_PORT="${WEBHOOK_PORT:-9876}"
WEBHOOK_TOKEN="${WEBHOOK_TOKEN:-$(cat /opt/data/secrets/hermes_windows.token)}"
LOG="/tmp/ruhrgutachten-deploy.log"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

deploy() {
  log "🚀 Deploy triggered"
  cd "$PROJECT_DIR"

  log "📥 Pulling latest..."
  GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
    git pull origin master 2>&1 | tee -a "$LOG"

  log "📦 Installing dependencies..."
  npm ci 2>&1 | tee -a "$LOG"

  log "🔨 Building..."
  npm run build 2>&1 | tee -a "$LOG"

  log "✅ Deploy complete — $(du -sh dist/ | cut -f1)"
}

# Simple webhook listener
handle_request() {
  read -r request
  read -r host
  read -r auth
  read -r content_type
  read -r content_length
  while IFS= read -r -t 0.1 line && [[ "$line" != $'\r' ]]; do :; done

  # Read body
  body=""
  if [[ -n "$content_length" ]]; then
    len=$(echo "$content_length" | grep -o '[0-9]*')
    read -r -n "$len" body 2>/dev/null || true
  fi

  token=$(echo "$auth" | grep -o 'Bearer .*' | cut -d' ' -f2)

  if [[ "$token" == "$WEBHOOK_TOKEN" ]]; then
    deploy &
    printf "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"deploying\"}"
  else
    printf "HTTP/1.1 401 Unauthorized\r\n\r\n"
  fi
}

# Main — start listener
if [[ "${1:-}" == "listen" ]]; then
  log "🔌 Webhook listener on :$WEBHOOK_PORT"
  while true; do
    handle_request | nc -l -p "$WEBHOOK_PORT" -q 1 || true
  done
else
  deploy
fi
