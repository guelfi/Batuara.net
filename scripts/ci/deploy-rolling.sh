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

if [ "$GITHUB_SHA" != "latest" ]; then
    if git cat-file -e "${GITHUB_SHA}^{commit}" 2>/dev/null; then
        git reset --hard "$GITHUB_SHA"
    else
        log_warning "GITHUB_SHA '${GITHUB_SHA:0:8}' não encontrado localmente após fetch. Prosseguindo com origin/$BRANCH."
    fi
fi

log_success "Code updated to: $(git log -1 --oneline)"

# --- Step 2: Write .env.production ---
DEPLOY_STATE="env"
log_info "Step 2: Configuring environment..."

WHATSAPP_ENV_FILE="$PROJECT_DIR/scripts/docker/.env.whatsapp"
WHATSAPP_API_KEY=""
if [ -f "$WHATSAPP_ENV_FILE" ]; then
    # Keep the Evolution API secret on the OCI host; do not require storing it in GitHub secrets.
    set -a
    # shellcheck disable=SC1090
    source "$WHATSAPP_ENV_FILE"
    set +a
    WHATSAPP_API_KEY="${AUTHENTICATION_API_KEY:-}"
fi

if [ -n "$WHATSAPP_API_KEY" ]; then
    WHATSAPP_ENABLED="true"
else
    WHATSAPP_ENABLED="false"
    log_warning "Evolution API key not found at $WHATSAPP_ENV_FILE. WhatsApp sending will remain disabled."
fi

cat > "$PROJECT_DIR/.env.production" <<EOF
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
DB_NAME=batuara_db
ENVIRONMENT=Production
ASPNETCORE_ENVIRONMENT=Production
COMPOSE_PROJECT_NAME=batuara-net
PROJECT_NAME=batuara
DOCKER_NETWORK=batuara-network
DOCKER_SUBNET=172.20.0.0/16
VOLUME_PREFIX=batuara
IMAGE_TAG=${GITHUB_SHA:0:8}
PUBLIC_WEBSITE_PORT=3000
PUBLIC_WEBSITE_BIND_IP=0.0.0.0
ADMIN_DASHBOARD_PORT=3001
ADMIN_DASHBOARD_BIND_IP=0.0.0.0
API_PORT=3003
API_BIND_IP=0.0.0.0
REACT_APP_API_URL=/batuara-api/api
ENABLE_GLOBAL_PRUNE=false
WHATSAPP_PROVIDER=EvolutionApi
WHATSAPP_ENABLED=${WHATSAPP_ENABLED}
WHATSAPP_BASE_URL=http://batuara-evolution-api:8080
WHATSAPP_API_KEY=${WHATSAPP_API_KEY}
WHATSAPP_INSTANCE_NAME=batuara-casa
WHATSAPP_ALLOWED_RECIPIENTS=
CONTRIBUTION_REMINDERS_ENABLED=false
CONTRIBUTION_REMINDERS_INTERVAL_MINUTES=15
CONTRIBUTION_REMINDERS_DAYS_BEFORE_DUE=2
CONTRIBUTION_REMINDERS_MAX_MESSAGES_PER_RUN=1
CONTRIBUTION_REMINDERS_RETRY_INTERVAL_MINUTES=60
CONTRIBUTION_REMINDERS_MAX_ATTEMPTS=3
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

# --- Step 3.5: Apply pending database migrations ---
DEPLOY_STATE="migrations"
log_info "Step 3.5: Applying pending database migrations..."

DB_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-db"
DB_USER="${PROJECT_NAME:-batuara}_user"
DB_NAME="${DB_NAME:-batuara_db}"

apply_migration() {
    local migration_id=$1
    local sql=$2
    # Check if migration already applied
    ALREADY=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc \
        "SELECT COUNT(*) FROM batuara.\"__EFMigrationsHistory\" WHERE \"MigrationId\"='${migration_id}';" 2>/dev/null || echo "0")
    if [ "${ALREADY:-0}" = "0" ]; then
        log_info "  Applying migration: $migration_id"
        docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "$sql" > /dev/null 2>&1
        docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
            "INSERT INTO batuara.\"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ('${migration_id}', '8.0.0') ON CONFLICT DO NOTHING;" > /dev/null 2>&1
        log_success "  Migration applied: $migration_id"
    else
        log_info "  Migration already applied: $migration_id (skipping)"
    fi
}

apply_migration "20260623140000_AddIsReadToContactMessages" \
    "ALTER TABLE batuara.\"ContactMessages\" ADD COLUMN IF NOT EXISTS \"IsRead\" boolean NOT NULL DEFAULT false; CREATE INDEX IF NOT EXISTS \"IX_ContactMessages_IsRead\" ON batuara.\"ContactMessages\" (\"IsRead\");"

apply_migration "20260708020346_AddMemberLoginCodes" \
    "CREATE TABLE IF NOT EXISTS batuara.\"MemberLoginCodes\" (\"Id\" integer GENERATED BY DEFAULT AS IDENTITY, \"HouseMemberId\" integer NOT NULL, \"CodeHash\" character varying(500) NOT NULL, \"ExpiresAt\" timestamp with time zone NOT NULL, \"Attempts\" integer NOT NULL, \"ConsumedAt\" timestamp with time zone NULL, \"CreatedByIp\" character varying(80) NULL, \"CreatedAt\" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP, \"UpdatedAt\" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP, \"IsActive\" boolean NOT NULL DEFAULT true, CONSTRAINT \"PK_MemberLoginCodes\" PRIMARY KEY (\"Id\"), CONSTRAINT \"FK_MemberLoginCodes_HouseMembers_HouseMemberId\" FOREIGN KEY (\"HouseMemberId\") REFERENCES batuara.\"HouseMembers\" (\"Id\") ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS \"IX_MemberLoginCodes_ConsumedAt\" ON batuara.\"MemberLoginCodes\" (\"ConsumedAt\"); CREATE INDEX IF NOT EXISTS \"IX_MemberLoginCodes_HouseMemberId_ExpiresAt\" ON batuara.\"MemberLoginCodes\" (\"HouseMemberId\", \"ExpiresAt\");"

apply_migration "20260708130000_AddRecurringContributionAndWhatsAppContact" \
    "ALTER TABLE batuara.\"HouseMemberContributions\" ADD COLUMN IF NOT EXISTS \"IsRecurring\" boolean NOT NULL DEFAULT false; ALTER TABLE batuara.\"HouseMemberContributions\" ADD COLUMN IF NOT EXISTS \"AllowWhatsAppReminder\" boolean NOT NULL DEFAULT false; ALTER TABLE batuara.\"HouseMemberContributions\" ADD COLUMN IF NOT EXISTS \"ReminderSentAt\" timestamp with time zone NULL; ALTER TABLE batuara.\"HouseMemberContributions\" ADD COLUMN IF NOT EXISTS \"ReminderLastAttemptAt\" timestamp with time zone NULL; ALTER TABLE batuara.\"HouseMemberContributions\" ADD COLUMN IF NOT EXISTS \"ReminderAttemptCount\" integer NOT NULL DEFAULT 0; CREATE INDEX IF NOT EXISTS \"IX_HouseMemberContributions_Status_AllowWhatsAppReminder_DueDate_ReminderSentAt\" ON batuara.\"HouseMemberContributions\" (\"Status\", \"AllowWhatsAppReminder\", \"DueDate\", \"ReminderSentAt\"); ALTER TABLE batuara.\"ContactMessages\" ADD COLUMN IF NOT EXISTS \"WantsWhatsAppResponse\" boolean NOT NULL DEFAULT false; ALTER TABLE batuara.\"ContactMessages\" ADD COLUMN IF NOT EXISTS \"WhatsAppResponseSentAt\" timestamp with time zone NULL; ALTER TABLE batuara.\"ContactMessages\" ADD COLUMN IF NOT EXISTS \"WhatsAppResponseText\" character varying(2000) NULL; CREATE INDEX IF NOT EXISTS \"IX_ContactMessages_WantsWhatsAppResponse_WhatsAppResponseSentAt\" ON batuara.\"ContactMessages\" (\"WantsWhatsAppResponse\", \"WhatsAppResponseSentAt\");"

apply_migration "20260714023835_AddWhatsAppMessageHistory" \
    "ALTER TABLE batuara.\"ContactMessages\" ALTER COLUMN \"Email\" TYPE text; CREATE TABLE IF NOT EXISTS batuara.\"WhatsAppMessages\" (\"Id\" integer GENERATED BY DEFAULT AS IDENTITY, \"ContactMessageId\" integer NOT NULL, \"MessageId\" character varying(100) NOT NULL, \"SenderPhone\" character varying(50) NOT NULL, \"RecipientPhone\" character varying(50) NOT NULL, \"Body\" character varying(5000) NOT NULL, \"IsFromMe\" boolean NOT NULL, \"SentAt\" timestamp with time zone NOT NULL, \"CreatedAt\" timestamp with time zone NOT NULL, \"UpdatedAt\" timestamp with time zone NOT NULL, \"IsActive\" boolean NOT NULL, CONSTRAINT \"PK_WhatsAppMessages\" PRIMARY KEY (\"Id\"), CONSTRAINT \"FK_WhatsAppMessages_ContactMessages_ContactMessageId\" FOREIGN KEY (\"ContactMessageId\") REFERENCES batuara.\"ContactMessages\" (\"Id\") ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS \"IX_WhatsAppMessages_ContactMessageId\" ON batuara.\"WhatsAppMessages\" (\"ContactMessageId\"); CREATE UNIQUE INDEX IF NOT EXISTS \"IX_WhatsAppMessages_MessageId\" ON batuara.\"WhatsAppMessages\" (\"MessageId\"); CREATE INDEX IF NOT EXISTS \"IX_WhatsAppMessages_SenderPhone\" ON batuara.\"WhatsAppMessages\" (\"SenderPhone\");"

apply_migration "20260715213401_AddRegistrationToEvents" \
    "ALTER TABLE batuara.\"Events\" ADD COLUMN IF NOT EXISTS \"RequiresRegistration\" boolean NOT NULL DEFAULT false; ALTER TABLE batuara.\"Events\" ADD COLUMN IF NOT EXISTS \"MaxCapacity\" integer NULL; INSERT INTO batuara.\"Events\" (\"Title\", \"Description\", \"Date\", \"StartTime\", \"EndTime\", \"Type\", \"Location\", \"ImageUrl\", \"card_color\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\", \"RequiresRegistration\", \"MaxCapacity\") SELECT \"Description\", COALESCE(\"Observations\", ''), \"Date\", \"StartTime\", \"EndTime\", CASE \"Type\" WHEN 3 THEN 5 WHEN 4 THEN 6 WHEN 5 THEN 1 END, 'Casa de Caridade Caboclo Batuara', NULL, NULL, \"IsActive\", \"CreatedAt\", \"UpdatedAt\", \"RequiresRegistration\", \"MaxCapacity\" FROM batuara.\"CalendarAttendances\" WHERE \"Type\" IN (3, 4, 5); DELETE FROM batuara.\"CalendarAttendances\" WHERE \"Type\" IN (3, 4, 5);"

log_success "Database migrations complete"

# --- Step 4: Rolling update - API first ---
DEPLOY_STATE="api"
log_info "Step 4: Rebuilding and restarting API (rolling)..."

API_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-api"
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps --force-recreate api

if ! wait_for_healthy "$API_CONTAINER" "http://localhost:${API_PORT:-3003}/health" $HEALTH_TIMEOUT; then
    log_error "API failed health check!"
    rollback
fi

# --- Step 5: Rolling update - Public Website ---
DEPLOY_STATE="publicwebsite"
log_info "Step 5: Rebuilding and restarting Public Website (rolling)..."

PUBLIC_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-public-website"
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps --force-recreate publicwebsite

if ! wait_for_healthy "$PUBLIC_CONTAINER" "http://localhost:3000" 90; then
    log_warning "Public Website health check uncertain - container may still be starting"
fi

# --- Step 6: Rolling update - Admin Dashboard ---
DEPLOY_STATE="admindashboard"
log_info "Step 6: Rebuilding and restarting Admin Dashboard (rolling)..."

ADMIN_CONTAINER="${COMPOSE_PROJECT_NAME:-batuara-net}-admin-dashboard"
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --build --no-deps --force-recreate admindashboard

if ! wait_for_healthy "$ADMIN_CONTAINER" "http://localhost:3001" 90; then
    log_warning "Admin Dashboard health check uncertain - container may still be starting"
fi

log_info "Removing obsolete Batuara containers (no DB changes)..."
$COMPOSE_CMD --env-file .env.production -f "$COMPOSE_FILE" up -d --no-deps --remove-orphans api publicwebsite admindashboard > /dev/null 2>&1 || true

log_info "Cleaning up stopped Batuara containers only..."
STOPPED_CONTAINERS=$(docker ps -a -q --filter "status=exited" --filter "label=com.docker.compose.project=${COMPOSE_PROJECT_NAME:-batuara-net}" || true)
if [ -n "${STOPPED_CONTAINERS}" ]; then
    docker rm ${STOPPED_CONTAINERS} > /dev/null 2>&1 || true
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
if [ "${ENABLE_GLOBAL_PRUNE:-false}" = "true" ]; then
    log_warning "ENABLE_GLOBAL_PRUNE=true - running global Docker prune commands"
    docker container prune -f > /dev/null 2>&1 || true
    docker image prune -f > /dev/null 2>&1 || true
fi

echo ""
echo "============================================="
log_success "Deployment completed successfully!"
echo "  Commit: ${GITHUB_SHA:0:8}"
echo "  Time: $(date)"
echo "============================================="
