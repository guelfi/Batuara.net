# Testing Admin Dashboard

## Overview
The Admin Dashboard is a React (Create React App) frontend located at `src/Frontend/AdminDashboard/`.

## Local Dev Server
```bash
cd src/Frontend/AdminDashboard
npm install --legacy-peer-deps
PORT=3001 npx react-scripts start
```
- Runs at `http://localhost:3001/batuara-admin/`
- Uses `homepage: "/batuara-admin/"` in package.json for base path
- No backend needed for UI-only testing (auth failures are handled gracefully)

## Build Verification
```bash
cd src/Frontend/AdminDashboard
npx react-scripts build
```
- Pre-existing ESLint warning about unused `RevokeTokenRequest` in AuthContext.tsx is known and unrelated
- Build output goes to `build/` folder

## Auth Flow Testing
The auth flow is managed by `AuthContext.tsx` and `api.ts`:
- On page load, `initializeAuth()` checks localStorage for `authToken` and `user`
- If tokens exist, calls `/auth/verify` to validate
- If no tokens, sets `isLoading=false` immediately and shows login page
- `ProtectedRoute.tsx` shows a spinner while `isLoading=true`, redirects to `/login` when not authenticated

### Reproducing Auth Issues
To test stale token handling (e.g., deadlock scenarios), set fake tokens in browser console:
```javascript
localStorage.setItem('authToken', 'fake-expired-token');
localStorage.setItem('user', JSON.stringify({id: 1, email: 'test@test.com', refreshToken: 'fake-refresh-token'}));
```
Then reload. The login page should render within seconds (not hang on spinner).

### Key Auth Behavior
- `/auth/refresh` and `/auth/login` bypass the axios 401 interceptor (to prevent deadlocks)
- `/auth/verify` goes through the interceptor (to allow silent token refresh)
- If refresh fails, auth data is cleared and user is redirected to login

## Login Page Verification
The login page should show:
- Title: "Casa de Caridade Batuara"
- Subtitle: "Dashboard Administrativo"
- Email field labeled "E-mail"
- Password field labeled "Senha"
- Button labeled "Entrar"
- Footer: "Acesso restrito aos administradores da Casa de Caridade Batuara"

### Form Validation
- Empty email: "E-mail é obrigatório"
- Invalid email format: "E-mail inválido"
- Empty password: "Senha é obrigatória"
- Password < 6 chars: "Senha deve ter pelo menos 6 caracteres"

## Production Deployment
- Public Website: `http://<OCI_HOST>/batuara-public/`
- API Swagger: `http://<OCI_HOST>/batuara-api/swagger/index.html`
- Admin Dashboard: `http://<OCI_HOST>/batuara-admin/`
- Default dev credentials: `admin@casabatuara.org.br / admin123`

## Devin Secrets Needed
- `OCI_SSH_PRIVATE_KEY` — SSH key for deploying to OCI server
- `OCI_HOST` — OCI server IP address
- `OCI_USER` — SSH username (ubuntu)
- `DB_PASSWORD` — PostgreSQL database password
- `JWT_SECRET` — JWT signing secret for API authentication

## Known Issues
- The `ws://localhost:8081/` WebSocket error in console is from React hot-reload and is harmless in production
- The admin dashboard API calls use relative URL `/batuara-api/api` which requires nginx reverse proxy in production
- Without a running backend, API calls return network errors — this is expected and the UI handles it gracefully
