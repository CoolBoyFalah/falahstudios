# Deploying Falah OS to os.falahstudios.com

Falah OS runs as two Vercel projects from this repo, plus a MongoDB Atlas database:

```
browser ──► os.falahstudios.com  (Vercel project "falah-os", root apps/os)
                 │  /api/*  is forwarded server-side
                 ▼
            falah-api.vercel.app (Vercel project "falah-api", root apps/api)
                 │
                 ▼
            MongoDB Atlas
```

The browser only ever talks to `os.falahstudios.com`, so there's no CORS setup.
The main site at falahstudios.com is untouched.

## 1. Database — MongoDB Atlas (free tier is fine)

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user with a strong password.
3. **Network Access** → add `0.0.0.0/0` (Vercel functions don't have fixed IPs).
4. **Connect → Drivers** → copy the connection string and add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/falah-studios?retryWrites=true&w=majority`

## 2. API project

Vercel → **Add New → Project** → import `CoolBoyFalah/falahstudios`:

| Setting | Value |
| --- | --- |
| Project name | `falah-api` |
| Root Directory | `apps/api` |
| Framework preset | Other (install/build come from `apps/api/vercel.json`) |

Environment variables (Production):

| Name | Value |
| --- | --- |
| `MONGODB_URI` | the Atlas string from step 1 |
| `JWT_SECRET` | a long random value — run `openssl rand -hex 32` |
| `NODE_ENV` | `production` |

Deploy, then check `https://<api-url>/api/health` returns `{"status":"ok"}`.

## 3. OS project

Add another project from the same repo:

| Setting | Value |
| --- | --- |
| Project name | `falah-os` |
| Root Directory | `apps/os` |
| Framework preset | Next.js |

Environment variable (Production):

| Name | Value |
| --- | --- |
| `API_ORIGIN` | the API project's URL, e.g. `https://falah-api.vercel.app` (no trailing slash) |

Deploy.

## 4. Domain — os.falahstudios.com

1. In the **falah-os** project → **Settings → Domains** → add `os.falahstudios.com`.
2. The domain's DNS is at GoDaddy (`ns77/ns78.domaincontrol.com`). In GoDaddy →
   **DNS → Add record**:
   - Type `CNAME`, Name `os`, Value: the target Vercel shows (usually `cname.vercel-dns.com`), TTL default.
3. Vercel issues the HTTPS certificate automatically once DNS resolves (minutes, occasionally up to an hour).

## 5. Create client workspaces in production

Run the client script locally against the Atlas database. The access code is
printed once, so send it to the client privately:

```bash
cd apps/api
MONGODB_URI="<atlas connection string>" npm run client:create -- "Business Name"
```

## Updating

Pushing to `main` redeploys both projects. Each only rebuilds when its own
folder changes if you enable **Settings → Git → Ignored Build Step →
"Only build if there are changes in the root directory"**.
