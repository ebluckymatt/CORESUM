# HTSG Web Deployment

This project now supports two ways to get off the local-only machine constraint:

1. temporary public preview using a tunnel to your running local app
2. hosted preview/production deployment through Vercel

## 1. Temporary public preview

Use this when you need a quick external link before full hosting is configured.

Requirements:

- the app must already be running locally on `http://127.0.0.1:3001`
- keep the machine awake and connected while the tunnel is in use

Start the local app:

```powershell
npm run private:preview
```

In a second terminal, open a temporary public tunnel:

```powershell
npm run web:tunnel
```

The command will print a public `https://...` URL. That URL is temporary and will stop working when the terminal closes or the local app stops.

If you want the tunnel to launch in the background and write the URL into a log file:

```powershell
npm run web:tunnel:background
```

Tunnel log location:

- `%LOCALAPPDATA%\HTSG-Execution-Platform-Private\web-tunnel.log`

Important limits:

- this is not production hosting
- performance depends on the local machine and internet connection
- the URL is disposable and should not be treated as a long-term employee link

## 2. Hosted preview deployment on Vercel

Use this when you want a stable internet URL for internal preview.

Prerequisites:

- a Vercel account
- `npx vercel login` completed on this machine, or a `VERCEL_TOKEN`
- bundled Node runtime already exists in `.tools/node`

Deploy a hosted preview:

```powershell
npm run deploy:web:preview
```

What the preview deployment does:

- deploys the app to Vercel
- keeps the app in `mock` data mode
- keeps development credentials enabled
- preserves admin bootstrap emails

This is suitable for product review, not employee rollout.

## 3. Production deployment on Vercel

Use this only after Microsoft Entra, database, storage, and email settings are ready.

Required production environment variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `CRON_SECRET`
- `HTSG_ADMIN_EMAILS`
- `AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID`
- `AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET`
- `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Optional production environment variables:

- `S3_ENDPOINT`
- `NEXTAUTH_URL`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Deploy to production:

```powershell
npm run deploy:web:production
```

What the production deployment does:

- deploys with `HTSG_DATA_MODE=database`
- disables development credentials
- requires Microsoft Entra SSO configuration
- pushes database, S3, email, and auth settings into Vercel build/runtime env

## 4. Environment reference

Use `.env.example` as the baseline template. Current expected auth env names are:

- `AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID`
- `AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET`
- `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`

These names must match `lib/env.ts`.

## 5. Current blocker for hosted deployment

The codebase is buildable and deploy-script ready, but hosted deployment from this machine is blocked until Vercel authentication exists.

Check login state:

```powershell
npx vercel whoami
```

Login if needed:

```powershell
npx vercel login
```

## 6. What is safe to distribute

Safe to distribute after hosted preview or production deployment:

- `/signin`
- `/projects`
- `/wiki`
- `/projects/proj-1`
- `/projects/proj-1/issues`
- `/projects/proj-1/inspections`
- `/projects/proj-1/deficiencies`

Not safe to distribute:

- `http://127.0.0.1:3001/...`
- a temporary tunnel URL after the tunnel process has stopped
