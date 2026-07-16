# MS Techno ERP (Multi-tenant SaaS)

Cloud multi-tenant POS / ERP you can sell to multiple businesses. Each shop is an **isolated tenant**.

## Structure

```
ms-techno/
  backend/     Express + MongoDB API
  frontend/    React (Vite) SPA
  legacy/      Original vanilla demo
```

## Multi-tenant model

| Role | Who | What they do |
|------|-----|----------------|
| Super admin | MS Techno | Create/approve tenants, plans, payments, renew, block |
| Shop tenant | Each business | Own products, POS (Premium+), stock, invoices — cannot see other shops |

Data isolation: every business record is scoped by `shop` / `shop_id`.

## Plans

| Plan | Monthly (PKR) | Product limit | POS |
|------|---------------|---------------|-----|
| Basic | 4,000 | 100 | No |
| Premium | 6,000 | Unlimited | Yes |
| Enterprise | Custom | Unlimited | Yes |

## How you onboard a business

1. They open the site → **Request demo** (`/signup`)
2. You open **Super Admin → Demo requests** → **Approve tenant**
3. Copy the generated username/password/login link and send to the shop
4. Or create a tenant directly under **All Shops → Create shop**

Shop login uses **username + password** only (no shop dropdown). Links look like:

`https://your-app.vercel.app/login?u=shopusername`

## Setup (local)

```bash
cd backend && npm install && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000  

## Hand off & deploy (Vercel + Railway + MongoDB Atlas)

See **[DEPLOY.md](./DEPLOY.md)** — GitHub transfer, Atlas DB, Railway API, Vercel frontend.

**Plans (live):** Basic Rs 4,000/mo (100 products, no POS) · Premium Rs 6,000/mo (unlimited + POS).

### Default super admin

- Username: `admin`
- Password: `Admin@123` (change after first login)

## Key APIs

- `GET /api/tenants/plans` — public plan catalog
- `POST /api/tenants/signup-request` — business signup / demo request
- `GET /api/tenants/signup-requests` — super only
- `POST /api/tenants/signup-requests/:id/approve` — creates tenant + one-time credentials
- Auth, shops, products, sales (JWT + shop scoping); POS gated by package
