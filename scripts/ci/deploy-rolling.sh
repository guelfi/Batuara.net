#!/bin/bash
set -euo pipefail

# =============================================================================
# Rolling Deploy Script for Batuara.net on Oracle Cloud (OCI)
# 
# This script performs a safe rolling update:
# 1. Pulls latest code from GitHub
# 2. Rebuilds and restarts containers ONE AT A TIME
# 3. Validates health after each container restart
# 4. NEVER touches the PostgreSQL database container
# 5. Connects nginx-proxy to the application Docker network
# 6. Rolls back on failure
#
# Required env vars: DB_PASSWORD, JWT_SECRET
# Optional env vars: GITHUB_SHA (for tagging)
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $(date '+%H:%M:%S') $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $(date '+%H:%M:%S') $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S') $1"; }

# Configuration
PROJECT_DIR="/var/www/batuara_net/Batuara.net"
COMPOSE_FILE="scripts/docker/docker-compose.production.yml"
REPO_URL="https://github.com/guelfi/Batuara.net.git"
BRANCH="master"
GITHUB_SHA="${GITHUB_SHA:-latest}"

# Timeouts
HEALTH_TIMEOUT=120  # seconds to wait for health check
HEALTH_INTERVAL=5   # seconds between health checks

# Track deployment state for rollback
DEPLOY_STATE="init"
PREVIOUS_COMMIT=""

# =============================================================================
# Helper Functions
# =============================================================================

wait_for_healthy() {
    local container_name=$1
    local check_url=$2
    local timeout=${3:-$HEALTH_TIMEOUT}
    local elapsed=0

    log_info "Waiting for $container_name to become healthy (timeout: ${timeout}s)..."

    while [ $elapsed -lt $timeout ]; do
        # Check if container is running
        if ! docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
            log_warning "$container_name is not running yet..."
            sleep $HEALTH_INTERVAL
            elapsed=$((elapsed + HEALTH_INTERVAL))
            continue
        fi

        # Check health endpoint if provided
        if [ -n "$check_url" ]; then
            if curl -sf --max-time 5 "$check_url" > /dev/null 2>&1; then
                log_success "$container_name is healthy!"
                return 0
            fi
        else
            # For containers without health URL, check Docker health status
            local status
            status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
            if [ "$status" = "healthy" ]; then
                log_success "$container_name is healthy!"
                return 0
            fi
            # If no health check configured, just check if running
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
        log_info "  ... waiting ($elapsed/${timeout}s)"
    done

    log_error "$container_name failed to become healthy after ${timeout}s"
    return 1
}

rollback() {
    log_error "DEPLOYMENT FAILED - Rolling back..."

    if [ -n "$PREVIOUS_COMMIT" ] && [ "$PREVIOUS_COMMIT" != "none" ]; then
        cd "$PROJECT_DIR"
        log_info "Reverting to previous commit: $PREVIOUS_COMMIT"
        git checkout "$PREVIOUS_COMMIT" -- . 2>/dev/null || true

        # Rebuild all services (except db)
        $COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps publicwebsite admindashboard api 2>/dev/null || true

        log_warning "Rollback attempted. Check container status manually."
    else
        log_warning "No previous commit to rollback to. Manual intervention required."
    fi

    exit 1
}

# =============================================================================
# Main Deploy Flow
# =============================================================================

echo ""
echo "============================================="
echo "  Batuara.net - Rolling Deploy"
echo "  $(date)"
echo "  Commit: ${GITHUB_SHA:0:8}"
echo "============================================="
echo ""

# Validate required env vars
if [ -z "${DB_PASSWORD:-}" ]; then
    log_error "DB_PASSWORD is not set!"
    exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
    log_error "JWT_SECRET is not set!"
    exit 1
fi

# --- Step 1: Ensure project directory exists and pull latest code ---
DEPLOY_STATE="pull"
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
    log_info "Previous commit: ${PREVIOUS_COMMIT:0:8}"

    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
fi

log_success "Code updated to: $(git log -1 --oneline)"

# --- Step 2: Write .env.production ---
DEPLOY_STATE="env"
log_info "Step 2: Configuring environment..."

cat > "$PROJECT_DIR/.env.production" <<EOF
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
DB_NAME=batuara_db
ENVIRONMENT=Production
ASPNETCORE_ENVIRONMENT=Production
COMPOSE_PROJECT_NAME=batuara-net
PROJECT_NAME=batuara
DOCKER_NETWORK=batuara-network
VOLUME_PREFIX=batuara
IMAGE_TAG=${GITHUB_SHA:0:8}
PUBLIC_WEBSITE_PORT=3000
ADMIN_DASHBOARD_PORT=3001
API_PORT=3003
REACT_APP_API_URL=/batuara-api/api
EOF

log_success "Environment configured"

# --- Step 3: Ensure database is running (NEVER rebuild) ---
DEPLOY_STATE="db"
log_info "Step 3: Ensuring database is running..."

# Use the compose command available on the system
COMPOSE_CMD="docker compose"
if ! docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
fi

# Start ONLY the db service if it's not running
DB_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-db"
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    log_success "Database container is already running - not touching it"
else
    log_info "Database container not running. Starting it..."
    $COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d db
    wait_for_healthy "$DB_CONTAINER" "" 60
fi

# --- Step 4: Rolling update - API first ---
DEPLOY_STATE="api"
log_info "Step 4: Rebuilding and restarting API (rolling)..."

API_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-api"
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps api

if ! wait_for_healthy "$API_CONTAINER" "http://localhost:${API_PORT:-3003}/health" $HEALTH_TIMEOUT; then
    log_error "API failed health check!"
    rollback
fi

# --- Step 5: Rolling update - Public Website ---
DEPLOY_STATE="publicwebsite"
log_info "Step 5: Rebuilding and restarting Public Website (rolling)..."

PUBLIC_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-public-website"
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps publicwebsite

if ! wait_for_healthy "$PUBLIC_CONTAINER" "http://localhost:3000" 90; then
    log_warning "Public Website health check uncertain - container may still be starting"
fi

# --- Step 6: Rolling update - Admin Dashboard ---
DEPLOY_STATE="admindashboard"
log_info "Step 6: Rebuilding and restarting Admin Dashboard (rolling)..."

ADMIN_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-admin-dashboard"
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps admindashboard

if ! wait_for_healthy "$ADMIN_CONTAINER" "http://localhost:3001" 90; then
    log_warning "Admin Dashboard health check uncertain - container may still be starting"
fi

# --- Step 7: Connect nginx-proxy to application network ---
DEPLOY_STATE="nginx"
log_info "Step 7: Connecting nginx-proxy to application network..."

DOCKER_NETWORK_NAME="${COMPOSE_PROJECT_NAME:-batuara-net}_${DOCKER_NETWORK:-batuara-network}"
NGINX_CONTAINER="nginx-proxy"

if docker ps --format '{{.Names}}' | grep -q "^${NGINX_CONTAINER}$"; then
    # Connect nginx-proxy to the application network (ignore error if already connected)
    if docker network connect "$DOCKER_NETWORK_NAME" "$NGINX_CONTAINER" 2>/dev/null; then
        log_success "nginx-proxy connected to $DOCKER_NETWORK_NAME"
    else
        log_info "nginx-proxy already connected to $DOCKER_NETWORK_NAME"
    fi

    # Graceful reload to re-resolve container DNS without dropping connections
    # Using nginx -s reload instead of docker restart to avoid:
    # 1. Downtime for other projects (MobileMed, etc.) sharing nginx-proxy
    # 2. Risk of losing dynamically-added network connections
    log_info "Reloading nginx-proxy to refresh container name resolution..."
    if docker exec "$NGINX_CONTAINER" nginx -t > /dev/null 2>&1; then
        docker exec "$NGINX_CONTAINER" nginx -s reload > /dev/null 2>&1 || true
        sleep 2
        log_success "nginx-proxy reloaded successfully"
    else
        log_warning "nginx-proxy configuration test failed - check /var/www/nginx/nginx.conf"
    fi

    # Verify nginx-proxy is still connected to the application network after reload
    if docker network inspect "$DOCKER_NETWORK_NAME" --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null | grep -q "$NGINX_CONTAINER"; then
        log_success "nginx-proxy confirmed on $DOCKER_NETWORK_NAME"
    else
        log_warning "nginx-proxy not found on $DOCKER_NETWORK_NAME - attempting reconnect"
        docker network connect "$DOCKER_NETWORK_NAME" "$NGINX_CONTAINER" 2>/dev/null || true
    fi
else
    log_warning "nginx-proxy container not found - skipping network connection"
    log_warning "If using nginx-proxy, connect it manually: docker network connect $DOCKER_NETWORK_NAME $NGINX_CONTAINER"
fi

# --- Step 8: Final verification ---
DEPLOY_STATE="verify"
log_info "Step 8: Final verification..."

echo ""
echo "=== Container Status ==="
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -i batuara || echo "No batuara containers found"

echo ""
echo "=== Health Checks ==="
check_endpoint() {
    local url=$1
    local name=$2
    if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
        log_success "$name: OK"
    else
        log_warning "$name: Not responding (may need more time)"
    fi
}
check_endpoint "http://localhost:${API_PORT:-3003}/health" "API"
check_endpoint "http://localhost:${PUBLIC_WEBSITE_PORT:-3000}" "PublicWebsite"
check_endpoint "http://localhost:${ADMIN_DASHBOARD_PORT:-3001}" "AdminDashboard"

# Check nginx-proxy routes if nginx-proxy is running
if docker ps --format '{{.Names}}' | grep -q "^${NGINX_CONTAINER}$"; then
    echo ""
    echo "=== Nginx Proxy Routes ==="
    check_endpoint "http://localhost/batuara-api/health" "Nginx → API"
    check_endpoint "http://localhost/batuara-public/" "Nginx → PublicWebsite"
    check_endpoint "http://localhost/batuara-admin/" "Nginx → AdminDashboard"
fi

# --- Cleanup ---
log_info "Cleaning up old Docker images..."
docker image prune -f > /dev/null 2>&1 || true

echo ""
echo "============================================="
log_success "Deployment completed successfully!"
echo "  Commit: ${GITHUB_SHA:0:8}"
echo "  Time: $(date)"
echo "============================================="
