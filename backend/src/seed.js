import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Shop } from './models/Shop.js';
import { Product } from './models/Product.js';
import { Announcement } from './models/Announcement.js';
import { slugify } from './config/plans.js';

async function seed() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scentra');

  const superUser = process.env.SEED_SUPER_USER || 'admin';
  const superPass = process.env.SEED_SUPER_PASS || 'Admin@123';

  let admin = await User.findOne({ username: superUser.toLowerCase() });
  if (!admin) {
    admin = await User.create({
      username: superUser.toLowerCase(),
      password: superPass,
      role: 'super',
    });
    console.log(`Created super admin: ${superUser} / ${superPass}`);
  } else {
    console.log(`Super admin already exists: ${superUser}`);
  }

  const shopCount = await Shop.countDocuments();
  if (shopCount === 0) {
    const planStart = new Date();
    const durationMonths = 12;
    const expiry = new Date(planStart);
    expiry.setFullYear(expiry.getFullYear() + 1);

    const shops = [
      {
        name: 'City Mart',
        owner: 'Ahmed',
        phone: '555-1001',
        email: 'ahmed@citymart.com',
        package: 'Premium',
        payment: 'paid',
        username: 'ahmed',
        password: 'ahmed123',
      },
      {
        name: 'Green Store',
        owner: 'Fatima',
        phone: '555-1002',
        email: 'fatima@greenstore.com',
        package: 'Basic',
        payment: 'paid',
        username: 'fatima',
        password: 'fatima123',
      },
      {
        name: 'Metro Hub',
        owner: 'Omar',
        phone: '555-1003',
        email: 'omar@metrohub.com',
        package: 'Enterprise',
        payment: 'paid',
        username: 'omar',
        password: 'omar123',
      },
    ];

    for (const s of shops) {
      const shop = await Shop.create({
        name: s.name,
        slug: slugify(s.name),
        owner: s.owner,
        phone: s.phone,
        email: s.email,
        package: s.package,
        payment: s.payment,
        planStart,
        durationMonths,
        expiry,
        paymentDueDate: planStart,
        restrictOnPaymentOverdue: true,
        status: 'active',
        openTime: '09:00',
        closeTime: '22:00',
        isTenant: true,
      });
      await User.create({
        username: s.username,
        password: s.password,
        role: 'shop',
        shop: shop._id,
      });
      await Product.insertMany([
        {
          shop: shop._id,
          name: 'Premium Bundle',
          brand: 'House Brand',
          category: 'General',
          qty: 45,
          buyPrice: 4500,
          sellPrice: 8900,
          barcode: `SKU-${s.username}-001`,
          desc: 'Top seller',
        },
        {
          shop: shop._id,
          name: 'Daily Essentials',
          brand: 'House Brand',
          category: 'General',
          qty: 32,
          buyPrice: 3800,
          sellPrice: 7500,
          barcode: `SKU-${s.username}-002`,
          desc: 'Everyday item',
        },
      ]);
      console.log(`Seeded shop ${s.name} (${s.username}/${s.password})`);
    }

    await Announcement.create({
      title: 'Welcome!',
      msg: 'MS Techno ERP is ready. Add products and start selling.',
      date: new Date().toISOString().split('T')[0],
      targetShop: null,
    });
  } else {
    console.log('Shops already present — skipping demo shop seed');
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
