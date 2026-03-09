# HTSG Execution Platform

Greenfield Next.js application for Halo Technical Solutions Global's construction execution platform.

## Included

- Next.js App Router structure
- Prisma schema covering project, accountability, quality, engineering, document, and reporting domains
- Async platform store with mock mode and Prisma-ready persistence seam
- Project dashboards and route map for the requested project modules
- Microsoft Entra-ready authentication with optional development credentials
- In-app user wiki stored directly in the application at `/wiki`
- Admin access management surface for users and project memberships
- Private preview scripts that run the app from a local folder outside OneDrive
- Production scaffolding for middleware, security headers, cron, and CI

## Core routes

- `/signin`
- `/projects`
- `/projects/[projectId]`
- `/projects/[projectId]/setup`
- `/projects/[projectId]/stakeholders`
- `/projects/[projectId]/wbs`
- `/projects/[projectId]/milestones`
- `/projects/[projectId]/actions`
- `/projects/[projectId]/issues`
- `/projects/[projectId]/risks`
- `/projects/[projectId]/quality`
- `/projects/[projectId]/inspections`
- `/projects/[projectId]/deficiencies`
- `/projects/[projectId]/engineering`
- `/projects/[projectId]/documents`
- `/projects/[projectId]/meetings`
- `/projects/[projectId]/reports`
- `/wiki`
- `/wiki/[slug]`
- `/admin/users`
- `/admin/templates`

## In-app wiki

The application now stores its operating guide directly in the product. Users can access it from the sidebar, from the Projects page, and from each module through contextual workflow guide links.

Current guide coverage includes:

- sign-in and access
- dashboard usage
- project setup and accountability
- stakeholder management
- WBS and milestones
- action management
- issue escalation
- risk management
- inspections and quality control
- deficiency closure
- engineering support
- document and submittal control
- meetings and decisions
- reporting and executive visibility
- admin access management

## Private local access

Use the private preview launcher if Next.js process spawning is unreliable from this OneDrive-backed folder.

### Recommended

Run one of these from the project root:

```powershell
.\scripts\run-private-preview.ps1
```

or

```powershell
.\scripts\run-private-preview.cmd
```

If you want the app to start in the background instead of occupying the terminal:

```powershell
npm run private:background
```

What it does:

1. Copies the app to `%LOCALAPPDATA%\HTSG-Execution-Platform-Private`
2. Creates `.env.local` from `.env.example` if needed
3. Installs dependencies in that private local folder
4. Generates Prisma client
5. Starts the app at `http://127.0.0.1:3001`

### Setup only

If you just want the private local workspace prepared without starting the server:

```powershell
.\scripts\setup-private-preview.ps1
```

or

```powershell
npm run private:setup
```

## Standard local setup

1. Install Node.js 20+ or use the bundled runtime in `.tools/node`
2. Copy `.env.example` to `.env`
3. Run `npm install`
4. Run `npm run prisma:generate`
5. Run `npm run dev`

## Production deployment baseline

Target production shape:

- Next.js on Vercel
- Microsoft Entra authentication through NextAuth
- PostgreSQL with Prisma as system of record
- S3-compatible object storage for evidence and attachments
- email notifications through Resend
- cron-driven overdue sweep on `/api/jobs/overdue`
- CI on GitHub Actions

Required production files now in repo:

- `middleware.ts`
- `next.config.ts`
- `vercel.json`
- `.github/workflows/ci.yml`
- `.env.example`

## Web access beyond this machine

Two supported paths now exist:

### Temporary public preview

Use this when you need a fast external link from the machine that is already running the app:

```powershell
npm run private:preview
```

Then in a second terminal:

```powershell
npm run web:tunnel
```

That command prints a temporary public URL backed by the local app on `127.0.0.1:3001`.

If you want the tunnel to start in the background and write the public URL to a log:

```powershell
npm run web:tunnel:background
```

### Hosted preview or production

Hosted deployment scripts are now included:

```powershell
npm run deploy:web:preview
npm run deploy:web:production
```

Preview deploy keeps the app in `mock` mode for review.

Production deploy requires:

- Vercel authentication
- PostgreSQL connection string
- Microsoft Entra credentials
- S3 credentials
- email provider credentials

Full deployment instructions:

- `docs/web-deployment.md`

## Current state

The UI, APIs, and admin surface are now wired through the async platform store, and the in-app wiki is integrated into the web application itself.

The main remaining step before real employee rollout is full database-backed production operation with real environment credentials and hosted deployment. Mock mode remains available for local review and product iteration.
