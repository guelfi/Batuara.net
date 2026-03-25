# Testing Batuara.net

## Overview
Batuara.net is a .NET 8 API + React frontend system deployed on OCI via Docker. Testing involves building and running containers locally since the dotnet SDK may not be available on the test machine.

## Devin Secrets Needed
- No secrets required for local testing (test credentials are generated inline)
- Production OCI access requires `OCI_SSH_PRIVATE_KEY` GitHub secret (managed by user)

## Production URLs
- Public Website: `http://129.153.86.168/batuara-public/`
- Admin Dashboard: `http://129.153.86.168/batuara-admin/`
- API Swagger: `http://129.153.86.168/batuara-api/swagger/index.html`
- API Health: `http://129.153.86.168/batuara-api/health`
- Default admin credentials: `admin@casabatuara.org.br / admin123`

## Local Testing Setup

### Building the API
The API uses .NET 8 SDK which may not be installed locally. Use Docker to build:
```bash
cd /home/ubuntu/repos/Batuara.net
docker build -f Dockerfile.api -t batuara-api-test .
```
This validates that all NuGet packages resolve and the code compiles.

### Running the API Locally
1. Start PostgreSQL:
```bash
DB_PASSWORD=testpass123 docker-compose -f docker-compose.db.yml up -d
```

2. Wait for DB readiness:
```bash
sleep 3 && docker exec batuara-db pg_isready -U postgres -d CasaBatuara
```

3. Start the API:
```bash
docker run -d --name batuara-api-test --network host \
  -e "ConnectionStrings__DefaultConnection=Host=localhost;Database=CasaBatuara;Username=postgres;Password=testpass123" \
  -e "JwtSettings__Secret=test-secret-key-that-is-at-least-32-characters-long-for-jwt-validation" \
  -e "ASPNETCORE_ENVIRONMENT=Development" \
  batuara-api-test
```

4. The API listens on port 8080. Access Swagger at `http://localhost:8080/swagger/index.html`

### Cleanup
```bash
docker stop batuara-api-test && docker rm batuara-api-test
docker-compose -f docker-compose.db.yml down
```

## Key Test Areas

### Security Headers
The `SecurityHeadersMiddleware` adds headers to every response. Verify with:
```bash
curl -sI http://localhost:8080/swagger/index.html
```
Expected headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (long list of disabled features)
- `Content-Security-Policy` with `connect-src` containing `http://api.batuara.net` (NOT `localhost:8080`)

### Serilog Structured Logging
Check that logs are JSON-formatted:
```bash
docker logs batuara-api-test 2>&1 | head -5
```
Each line should be a JSON object with `Timestamp`, `Level`, `MessageTemplate`, `Properties` including `MachineName`, `Application`, `Environment`.

### gitleaks Configuration
Install gitleaks to validate `.gitleaks.toml`:
```bash
curl -sSL https://github.com/gitleaks/gitleaks/releases/download/v8.24.3/gitleaks_8.24.3_linux_x64.tar.gz | tar xz -C /tmp/
/tmp/gitleaks detect --config .gitleaks.toml --no-git --source . --verbose --exit-code 0 2>&1 | head -20
```
If the config is valid, gitleaks will start scanning. If invalid, it will crash with a TOML parse or regex error.

**Important TOML gotcha**: gitleaks `paths` in `[allowlist]` are **regex patterns**, not globs. And TOML double-quoted strings treat `\` as escape — so `\.` in regex must be written as `\\.` in TOML double-quoted strings. Alternatively, use TOML literal strings (single quotes) to avoid escaping issues.

### Backup Scripts
Validate syntax without running:
```bash
bash -n scripts/backup/backup-postgres.sh
bash -n scripts/backup/restore-postgres.sh
bash -n scripts/backup/setup-cron.sh
```
Verify the default DB name is `CasaBatuara` (not `batuara`).

### Production Regression
Verify production URLs respond HTTP 200:
```bash
curl -s -o /dev/null -w "%{http_code}" http://129.153.86.168/batuara-public/
curl -s -o /dev/null -w "%{http_code}" http://129.153.86.168/batuara-api/swagger/index.html
curl -s -o /dev/null -w "%{http_code}" http://129.153.86.168/batuara-admin/
curl -s http://129.153.86.168/batuara-api/health
```
Health check should return `{"status":"healthy",...}`.

## Notes
- The database name is `CasaBatuara` (capital C and B), not `batuara`
- The API uses path base `/batuara-api` in production (via nginx proxy), but locally it's just `http://localhost:8080/`
- JWT Secret must be at least 32 characters; placeholder values like `CHANGE_ME` are rejected in Production environment
- The branch for CI/CD is `master` (not `main`)
- npm audit may show high-severity vulnerabilities from `react-scripts` (CRA) transitive deps — these are unfixable without ejecting from CRA. CI uses `--audit-level=critical` to avoid false failures
