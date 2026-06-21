# AoTTG 2 - Website

The website is being developed using Vite, React, and TypeScript.

## Getting Started

To get started with contributing to the website, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AoTTG-2/Aottg2-Website
   ```
2. **Install dependencies:**
   ```bash
   cd Aottg2-Website && npm install
   ```
3. **Configure local auth API:**
   ```bash
   cp .env.example .env.local
   # optional: SHOW_LOGIN_NAV=false hides LOGIN/ACCOUNT from navbar only
   # npm run dev:local pins API calls to /accounts-api -> http://localhost:5010
   ```
4. **Run the development server:**
   ```bash
   # Frontend + local auth service at http://localhost:5010/v1
   # Uses .env.local-auth, then pins npm env so stale shell vars cannot hit prod.
   # Also runs ../AoTTG-2-auth-service/scripts/deploy-local.sh first.
   npm run dev:local

   # Start/restart only the local auth service helper.
   npm run deploy-local

   # Frontend + production auth service at https://aottg2.com/v1
   # Uses .env.prod-auth
   npm run dev:prod
   ```
## DevOps / Production Deploy

Production deploy is owned by the infra repo:

```text
https://github.com/AoTTG-2/AoTTG2-Infra
```

Read the infra README for the full VPS flow, nginx routing, secrets, rollback, and health checks.

### Responsibility Split

```text
Aottg2-Website repo
  -> owns website source code
  -> owns website Dockerfile
  -> owns GitHub Actions image build
  -> pushes website images to GHCR

AoTTG2-Infra repo
  -> owns VPS docker-compose.yml
  -> owns nginx routing for aottg2.com
  -> selects which website image tag production runs
  -> deploys/rolls back on the VPS
```

The VPS does not build this repo from source. It pulls a prebuilt GHCR image.

### Production URLs

```text
https://aottg2.com/       -> this website container
https://aottg2.com/Game/* -> preserved launcher files from /var/www/html/Game on VPS
https://aottg2.com/v1/*   -> auth-service container
```

### Image Build Pipeline

Workflow file:

```text
.github/workflows/build-image.yml
```

On push to `main`:

```text
npm ci
npm run lint
npm run build
Docker build
Docker push to GHCR
```

Default production build args:

```text
VITE_AUTH_API_BASE_URL=
SHOW_LOGIN_NAV=true
```

The empty `VITE_AUTH_API_BASE_URL` makes browser API calls same-origin:

```text
/v1/auth/login
/v1/me
/v1/patreon/...
```

Nginx on the VPS proxies `/v1/*` to the auth-service container.

### GHCR Images

```text
ghcr.io/aottg-2/aottg2-website:<commit-sha>
ghcr.io/aottg-2/aottg2-website:main
ghcr.io/aottg-2/aottg2-website:main-no-login
```

### Login Nav Builds

The navbar login/account links are build-time controlled by `SHOW_LOGIN_NAV`.

Normal `main` push builds:

```text
ghcr.io/aottg-2/aottg2-website:main
SHOW_LOGIN_NAV=true
```

Manual no-login build:

```text
GitHub Actions -> Build GHCR image -> Run workflow
show_login_nav=false
```

That pushes:

```text
ghcr.io/aottg-2/aottg2-website:main-no-login
```

Production currently uses `main-no-login` through infra:

```text
/opt/aottg2/infra/.env
WEBSITE_TAG=main-no-login
```

### Production Deploy After Website Change

1. Merge/push website code to `main`.
2. Wait for `Build GHCR image` workflow to pass.
3. If production should hide login nav, manually run the workflow with `show_login_nav=false`.
4. Deploy from infra repo/VPS:

```bash
cd /opt/aottg2/infra
git pull --ff-only
./scripts/deploy.sh
./scripts/healthcheck.sh
```

5. Verify:

```bash
curl -I https://aottg2.com
curl -I https://aottg2.com/Game/Windows/Launcher/VersionInfo.info
curl https://aottg2.com/health/live
```

### Local Docker Smoke

```bash
docker build \
  --build-arg VITE_AUTH_API_BASE_URL= \
  --build-arg SHOW_LOGIN_NAV=false \
  -t aottg2-website:no-login .

docker run --rm -p 8080:80 aottg2-website:no-login
```

Then open:

```text
http://localhost:8080
```

## Dev Tools

### Tools
- React
- TypeScript
### UI Libraries
- Framer Motion
- Tailwind


## Webdevs
- gisketch
- Godinho



