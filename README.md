# MS Techno ERP (Multi-tenant SaaS)

Cloud perfume POS / ERP you can sell to multiple businesses. Each shop is an **isolated tenant**.

## Structure

```
perfume/
  backend/     Express + MongoDB API
  frontend/    React (Vite) SPA
  legacy/      Original vanilla demo
```

## Multi-tenant model

| Role | Who | What they do |
|------|-----|----------------|
| Super admin (you) | MS Techno | Create/approve tenants, plans, payments, renew, block |
| Shop tenant | Each business | Own products, POS, stock, invoices — cannot see other shops |

Data isolation: every business record is scoped by `shop` / `shop_id`.

## Plans

| Plan | Monthly (PKR) | Product limit |
|------|---------------|---------------|
| Basic | 2,999 | 100 |
| Premium | 5,999 | 500 |
| Enterprise | 12,999 | 5,000 |

## How you onboard a business

1. They open the site → **Start free request** (`/signup`)
2. You open **Super Admin → Signup requests** → **Approve tenant**
3. Copy the generated username/password and send to the shop
4. Or create a tenant directly under **All Shops → Create shop**

## Setup (local)

```bash
cd backend && npm install && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000  

## Hand off & deploy (Vercel + Railway + MongoDB Atlas)

See **[DEPLOY.md](./DEPLOY.md)** — GitHub transfer, Atlas DB, Railway API, Vercel frontend.  

### Default super admin

- Username: `admin`
- Password: `Admin@123`

## Key APIs

- `GET /api/tenants/plans` — public plan catalog
- `POST /api/tenants/signup-request` — business signup
- `GET /api/tenants/signup-requests` — super only
- `POST /api/tenants/signup-requests/:id/approve` — creates tenant + login
- Auth, shops, products, sales, etc. as before (JWT + shop scoping)
