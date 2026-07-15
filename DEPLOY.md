# Transfer & Deploy Guide (MS Techno ERP)

Hand this repo to your friend. Stack:

| Piece | Service |
|-------|---------|
| Frontend (React) | **Vercel** |
| Backend (Express API) | **Railway** |
| Database | **MongoDB Atlas** |

---

## Part A — Transfer code to your friend’s PC (GitHub)

### On your PC (you)

1. Create a GitHub account repo (private is fine), e.g. `ms-techno-erp`.
2. In the project folder:

```bash
cd d:\perfume
git init
git add .
git commit -m "MS Techno multi-tenant ERP ready for deploy"
git branch -M main
git remote add origin https://github.com/HIS_OR_YOUR_USERNAME/ms-techno-erp.git
git push -u origin main
```

3. Invite your friend as a collaborator (GitHub → Settings → Collaborators), **or** transfer the repo to his account.

### On your friend’s PC

```bash
git clone https://github.com/USERNAME/ms-techno-erp.git
cd ms-techno-erp
```

Install Node.js LTS from https://nodejs.org if needed.

**Do not commit `.env` files** (they stay local / on host dashboards).

---

## Part B — MongoDB Atlas (his account)

1. Go to https://cloud.mongodb.com → sign up / log in.
2. Create a free **M0** cluster.
3. **Database Access** → Add user (username + strong password). Save it.
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for Railway (simplest for starters).
5. **Database** → Connect → Drivers → copy the URI:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mstechno?retryWrites=true&w=majority
```

Replace `USER` / `PASSWORD` (URL-encode special chars in password).

---

## Part C — Backend on Railway (his account)

1. Go to https://railway.app → Login with GitHub.
2. **New Project** → **Deploy from GitHub repo** → select `ms-techno-erp`.
3. Settings:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start` (already in `package.json`)
4. **Variables** (Railway → Variables):

| Name | Value |
|------|--------|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | long random string (password manager) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | will set after Vercel URL exists (comma-ok) |
| `SEED_SUPER_USER` | `admin` |
| `SEED_SUPER_PASS` | strong password for first super admin |

5. Deploy → open the public URL, e.g. `https://ms-techno-api.up.railway.app`
6. Test: `https://YOUR-RAILWAY-URL/api/health` → should show `{ "ok": true, ... }`
7. Seed once (optional) from his PC with Atlas URI:

```bash
cd backend
# set MONGODB_URI in a temporary .env pointing to Atlas
npm install
npm run seed
```

Or seed locally once against Atlas, then never need seed again.

---

## Part D — Frontend on Vercel (his account)

1. Go to https://vercel.com → Login with GitHub.
2. **Add New Project** → Import `ms-techno-erp`.
3. Settings:
   - **Root Directory:** `frontend`
   - Framework: Vite (auto)
4. **Environment Variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL/api` |

Important: must include `/api` at the end.

5. Deploy → you get `https://something.vercel.app`
6. Go back to **Railway** → set:

```text
CLIENT_URL=https://something.vercel.app
```

Redeploy backend (or restart) so CORS allows the Vercel domain.

7. Open the Vercel site → Login as super admin (seed credentials).

---

## Part E — Checklist after deploy

- [ ] `/api/health` works on Railway  
- [ ] Landing page loads on Vercel  
- [ ] Login works (shop + super)  
- [ ] Create shop / approve signup works  
- [ ] Change `SEED_SUPER_PASS` / change password in app after first login  
- [ ] MongoDB Network Access allows Railway  

---

## Local run on friend’s PC (optional)

```bash
# Terminal 1 — API
cd backend
cp .env.example .env
# edit .env with Atlas URI or local Mongo
npm install
npm run seed
npm run dev

# Terminal 2 — UI
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## What you should NOT send him

- Your personal `.env` with secrets (create fresh on his Railway/Atlas)
- `node_modules` folders
- Production passwords in chat — use his own seed password

## What you SHOULD send him

- GitHub repo access
- This `DEPLOY.md`
- Default seed note (he must change password after first login)
