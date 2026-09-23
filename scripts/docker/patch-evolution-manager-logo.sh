#!/usr/bin/env bash
# O Manager aponta o header para https://evolution-api.com/files/evo/*.svg (404).
# Troca pelo PNG local já empacotado em /assets/images/evolution-logo.png.
# Rodar na OCI, sem recriar o container (não derruba as sessões WhatsApp).
set -euo pipefail

docker exec batuara-evolution-api sh -c '
set -eu
for f in /evolution/manager/dist/assets/index-*.js /evolution/manager/dist/index.html; do
  [ -f "$f" ] || continue
  sed -i \
    -e "s#https://evolution-api.com/files/evo/evolution-logo-white.svg#/assets/images/evolution-logo.png#g" \
    -e "s#https://evolution-api.com/files/evo/evolution-logo.svg#/assets/images/evolution-logo.png#g" \
    -e "s#https://evolution-api.com/files/evo/favicon.svg#/assets/images/evolution-logo.png#g" \
    "$f"
done
echo leftover:
grep -R -o "https://evolution-api.com/files/evo/[^\" ]*" \
  /evolution/manager/dist/assets/index-*.js /evolution/manager/dist/index.html 2>/dev/null || echo none
'
