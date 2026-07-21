import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { Shop } from './models/Shop.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import { slugify } from './config/plans.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = String(process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ms-techno-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/announcements', announcementRoutes);

app.use(errorHandler);

async function backfillShopPlans() {
  const shops = await Shop.find({});
  let updated = 0;
  for (const shop of shops) {
    let dirty = false;
    if (!shop.planStart) {
      shop.planStart = shop.createdAt || new Date();
      dirty = true;
    }
    if (!shop.durationMonths) {
      const days = Math.max(
        1,
        Math.round((new Date(shop.expiry) - new Date(shop.planStart)) / 86400000)
      );
      shop.durationMonths = Math.max(1, Math.round(days / 30.44));
      dirty = true;
    }
    if (!shop.paymentDueDate) {
      shop.paymentDueDate = shop.planStart;
      dirty = true;
    }
    if (shop.restrictOnPaymentOverdue === undefined || shop.restrictOnPaymentOverdue === null) {
      shop.restrictOnPaymentOverdue = true;
      dirty = true;
    }
    if (!shop.slug) {
      let base = slugify(shop.name);
      let candidate = base;
      let i = 0;
      while (await Shop.findOne({ slug: candidate, _id: { $ne: shop._id } })) {
        i += 1;
        candidate = `${base}-${i}`;
      }
      shop.slug = candidate;
      dirty = true;
    }
    if (shop.isTenant === undefined || shop.isTenant === null) {
      shop.isTenant = true;
      dirty = true;
    }
    if (dirty) {
      await shop.save();
      updated += 1;
    }
  }
  if (updated) console.log(`Backfilled SaaS tenant fields for ${updated} shop(s)`);
}

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scentra');
  await backfillShopPlans();
  app.listen(PORT, () => {
    console.log(`MS Techno API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
