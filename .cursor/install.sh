#!/usr/bin/env bash
# Cloud Agent install phase for Batuara.net.
# Idempotent: installs system toolchains, restores/builds the .NET solution,
# installs frontend dependencies, and generates the dev database schema from
# the EF Core model. Must terminate (no long-running processes here).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

echo "==> Installing system packages (PostgreSQL 16, .NET 8 SDK)"
export DEBIAN_FRONTEND=noninteractive
if ! command -v psql >/dev/null 2>&1 || ! command -v dotnet >/dev/null 2>&1; then
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq postgresql postgresql-contrib dotnet-sdk-8.0
fi

export PATH="$PATH:$HOME/.dotnet/tools"

echo "==> Restoring and building the .NET solution"
dotnet build Batuara.sln -c Release

echo "==> Installing frontend dependencies"
# react-scripts 5 has legacy peer-dep conflicts with the pinned TypeScript 6, so
# --legacy-peer-deps is required for both apps.
( cd src/Frontend/PublicWebsite && npm install --legacy-peer-deps --no-audit --no-fund )
( cd src/Frontend/AdminDashboard && npm install --legacy-peer-deps --no-audit --no-fund )

echo "==> Generating dev database schema from the EF Core model"
# The repo's EF migrations are incremental on top of a baseline that is not in
# the repo (production is normally restored from a dump). To bootstrap a fresh
# local database we generate a full-schema SQL file from the current model.
GEN_DIR="$REPO_ROOT/.cursor/generated"
mkdir -p "$GEN_DIR"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT
cp -r "$REPO_ROOT/src/Backend" "$SCRATCH/Backend"
cp "$REPO_ROOT/NuGet.Config" "$SCRATCH/" 2>/dev/null || true
find "$SCRATCH" -type d \( -name bin -o -name obj \) -prune -exec rm -rf {} + 2>/dev/null || true
rm -f "$SCRATCH/Backend/Batuara.Infrastructure/Data/Migrations/"*.cs
dotnet tool install --global dotnet-ef --version '8.*' >/dev/null 2>&1 || true
( cd "$SCRATCH/Backend/Batuara.Infrastructure" \
  && dotnet ef migrations add InitialSchema \
       --startup-project ../Batuara.API/Batuara.API.csproj -c BatuaraDbContext \
  && dotnet ef migrations script \
       --startup-project ../Batuara.API/Batuara.API.csproj -c BatuaraDbContext \
       -o "$GEN_DIR/dev-schema.sql" )

echo "==> Install phase complete"
