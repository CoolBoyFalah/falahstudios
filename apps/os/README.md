# Falah OS

The client workspace for Falah Studios customers: orders, customers, bookings,
catalog, analytics, insights and website content, in English and Arabic, dark
and light.

## Running locally

```bash
# 1. API (from apps/api) — needs MongoDB running
npm run dev            # http://localhost:5001/api

# 2. Falah OS (from apps/os)
npm run dev            # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` if the API isn't at `http://localhost:5001/api`.
The API's `FRONTEND_URL` accepts a comma-separated list of allowed origins.

## Creating a client

Clients sign in with an access code shaped `FAL-<CLIENT CODE>-<SECRET>`. Only a
hash of the secret is stored, so the code is shown once:

```bash
cd apps/api
npm run client:create -- "Business Name" [slug]
npm run client:create -- --rotate <CLIENT CODE>   # issue a new code
```

## Structure

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Access-code sign-in |
| `app/dashboard/*` | Workspace pages (all client components) |
| `app/receipt/[id]` | Printable order receipt |
| `components/Shell.tsx` | Sidebar, mobile drawer, auth guard, notification badge |
| `components/ui.tsx` | Shared UI: panels, buttons, fields, sheets, toasts, status pills |
| `lib/i18n.tsx` | English/Arabic strings (side by side), RTL, theme, number/date formatting |
| `lib/api.ts` | Fetch wrapper; 401s sign the user out |
| `lib/useResource.ts` | Data-loading hook that ignores stale responses |

Colours are CSS variables in `app/globals.css` (RGB channels, so Tailwind
opacity modifiers work) and are exposed to Tailwind as `bg`, `surface`, `line`,
`fg`, `muted`, `faint`, `gold`, `chart`, etc. Add new copy to `lib/i18n.tsx` as
an `[English, Arabic]` pair.
