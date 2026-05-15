#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $(date '+%H:%M:%S') $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $(date '+%H:%M:%S') $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S') $1"; }

PROJECT_DIR="/var/www/batuara_net/Batuara.net"
COMPOSE_FILE="scripts/docker/docker-compose.production.yml"
REPO_URL="https://github.com/guelfi/Batuara.net.git"
BRANCH="master"
GITHUB_SHA="${GITHUB_SHA:-latest}"

ENV_FILE=".env.staging"
HEALTH_TIMEOUT=120
HEALTH_INTERVAL=5

PREVIOUS_COMMIT=""

wait_for_healthy() {
    local container_name=$1
    local check_url=$2
    local timeout=${3:-$HEALTH_TIMEOUT}
    local elapsed=0

    log_info "Waiting for $container_name to become healthy (timeout: ${timeout}s)..."

    while [ $elapsed -lt $timeout ]; do
        if ! docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
            sleep $HEALTH_INTERVAL
            elapsed=$((elapsed + HEALTH_INTERVAL))
            continue
        fi

        if [ -n "$check_url" ]; then
            if curl -sf --max-time 5 "$check_url" > /dev/null 2>&1; then
                log_success "$container_name is healthy!"
                return 0
            fi
        else
            local status
            status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
            if [ "$status" = "healthy" ]; then
                log_success "$container_name is healthy!"
                return 0
            fi
            if [ "$status" = "unknown" ]; then
                local state
                state=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "unknown")
                if [ "$state" = "running" ]; then
                    log_success "$container_name is running!"
                    return 0
                fi
            fi
        fi

        sleep $HEALTH_INTERVAL
        elapsed=$((elapsed + HEALTH_INTERVAL))
    done

    log_error "$container_name failed to become healthy after ${timeout}s"
    return 1
}

rollback() {
    log_error "STAGING DEPLOYMENT FAILED - Rolling back..."

    if [ -n "$PREVIOUS_COMMIT" ] && [ "$PREVIOUS_COMMIT" != "none" ]; then
        cd "$PROJECT_DIR"
        git checkout "$PREVIOUS_COMMIT" -- . 2>/dev/null || true
    fi

    exit 1
}

echo ""
echo "============================================="
echo "  Batuara.net - Staging Deploy"
echo "  $(date)"
echo "  Commit: ${GITHUB_SHA:0:8}"
echo "============================================="
echo ""

if [ -z "${DB_PASSWORD:-}" ]; then
    log_error "DB_PASSWORD is not set!"
    exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
    log_error "JWT_SECRET is not set!"
    exit 1
fi

log_info "Step 1: Pulling latest code..."

if [ ! -d "$PROJECT_DIR" ]; then
    log_info "Project directory not found. Cloning..."
    mkdir -p "$(dirname "$PROJECT_DIR")"
    cd "$(dirname "$PROJECT_DIR")"
    git clone -b "$BRANCH" "$REPO_URL" "$(basename "$PROJECT_DIR")"
    cd "$PROJECT_DIR"
    PREVIOUS_COMMIT="none"
else
    cd "$PROJECT_DIR"
    PREVIOUS_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
fi

if [ "$GITHUB_SHA" != "latest" ]; then
    if git cat-file -e "${GITHUB_SHA}^{commit}" 2>/dev/null; then
        git reset --hard "$GITHUB_SHA"
    else
        log_warning "GITHUB_SHA '${GITHUB_SHA:0:8}' não encontrado localmente após fetch. Prosseguindo com origin/$BRANCH."
    fi
fi

log_success "Code updated to: $(git log -1 --oneline)"

log_info "Step 2: Configuring staging environment..."

cat > "$PROJECT_DIR/$ENV_FILE" <<EOF
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
DB_NAME=batuara_db_stg
ENVIRONMENT=Staging
ASPNETCORE_ENVIRONMENT=Staging
COMPOSE_PROJECT_NAME=batuara-stg
PROJECT_NAME=batuara-stg
DOCKER_NETWORK=batuara-stg-network
DOCKER_SUBNET=172.30.0.0/16
VOLUME_PREFIX=batuara-stg
IMAGE_TAG=${GITHUB_SHA:0:8}
PUBLIC_WEBSITE_PORT=3100
PUBLIC_WEBSITE_BIND_IP=127.0.0.1
ADMIN_DASHBOARD_PORT=3101
ADMIN_DASHBOARD_BIND_IP=127.0.0.1
API_PORT=3103
API_BIND_IP=127.0.0.1
REACT_APP_API_URL=/batuara-api/api
ENABLE_GLOBAL_PRUNE=false
EOF

log_success "Staging environment configured"

COMPOSE_CMD="docker compose"
if ! docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
fi

log_info "Step 3: Ensuring staging database is running..."
DB_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-stg}-db"
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    log_success "Staging database container is already running - not touching it"
else
    $COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db
    wait_for_healthy "$DB_CONTAINER" "" 60
fi

log_info "Step 4: Rebuilding and restarting API (staging)..."
API_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-stg}-api"
$COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --no-deps --force-recreate api
if ! wait_for_healthy "$API_CONTAINER" "http://localhost:${API_PORT:-3103}/health" $HEALTH_TIMEOUT; then
    rollback
fi

log_info "Step 5: Rebuilding and restarting Public Website (staging)..."
PUBLIC_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-stg}-public-website"
$COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --no-deps --force-recreate publicwebsite
wait_for_healthy "$PUBLIC_CONTAINER" "http://localhost:${PUBLIC_WEBSITE_PORT:-3100}" 90 || true

log_info "Step 6: Rebuilding and restarting Admin Dashboard (staging)..."
ADMIN_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-stg}-admin-dashboard"
$COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --no-deps --force-recreate admindashboard
wait_for_healthy "$ADMIN_CONTAINER" "http://localhost:${ADMIN_DASHBOARD_PORT:-3101}" 90 || true

log_info "Removing orphan staging containers only..."
$COMPOSE_CMD --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-deps --remove-orphans api publicwebsite admindashboard > /dev/null 2>&1 || true

echo ""
echo "=== Staging Container Status ==="
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -i batuara-stg || echo "No staging containers found"

echo ""
echo "=== Staging Health Checks ==="
curl -sf "http://localhost:${API_PORT:-3103}/health" > /dev/null 2>&1 && log_success "API (staging): OK" || log_error "API (staging): FAIL"
curl -sf "http://localhost:${PUBLIC_WEBSITE_PORT:-3100}" > /dev/null 2>&1 && log_success "PublicWebsite (staging): OK" || log_warning "PublicWebsite (staging): Not responding"
curl -sf "http://localhost:${ADMIN_DASHBOARD_PORT:-3101}" > /dev/null 2>&1 && log_success "AdminDashboard (staging): OK" || log_warning "AdminDashboard (staging): Not responding"

echo ""
echo "============================================="
log_success "Staging deployment completed successfully!"
echo "  Commit: ${GITHUB_SHA:0:8}"
echo "  Time: $(date)"
echo "============================================="

