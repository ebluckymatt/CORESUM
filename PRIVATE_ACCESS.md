# Private Access Notes

This app is currently configured for private use only.

## Fastest way to open it

From `C:\Users\ITHTS\OneDrive\Desktop\01. CURSOR PROJECTS`, run:

```powershell
.\scripts\run-private-preview.ps1
```

Then open:

- [http://127.0.0.1:3001/projects](http://127.0.0.1:3001/projects)
- [http://127.0.0.1:3001/signin](http://127.0.0.1:3001/signin)

## Why this uses a copied local folder

Next.js was hitting a Windows `spawn EPERM` issue from the OneDrive-backed workspace. The preview script avoids that by running from `%LOCALAPPDATA%\HTSG-Execution-Platform-Private` instead.

## Current limits

- mock-backed data, not real database persistence
- sign-in is scaffolded, not hardened
- safe for private review, not production operations

## Keep it private

- do not publish this repo publicly
- do not share the preview URL
- do not onboard other users until persistence and auth are hardened
