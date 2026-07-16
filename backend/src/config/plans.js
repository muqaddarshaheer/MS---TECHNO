/** MS Techno multi-tenant SaaS plan catalog */
export const SAAS_PLANS = {
  Basic: {
    key: 'Basic',
    name: 'Basic',
    priceMonthlyPkr: 4000,
    priceYearlyPkr: 40000,
    maxProducts: 100,
    maxUsers: 1,
    features: {
      pos: false,
      invoices: true,
      stock: true,
      reports: true,
      reviews: false,
      profitInsights: false,
    },
    featureList: [
      'Stock & inventory',
      'Customers & expenses',
      'Daily / monthly reports',
      'Up to 100 products',
      '1 shop login',
    ],
  },
  Premium: {
    key: 'Premium',
    name: 'Premium',
    priceMonthlyPkr: 6000,
    priceYearlyPkr: 60000,
    maxProducts: null,
    maxUsers: 3,
    features: {
      pos: true,
      invoices: true,
      stock: true,
      reports: true,
      reviews: true,
      profitInsights: true,
    },
    featureList: [
      'Everything in Basic',
      'POS & barcode billing',
      'Receipt printing',
      'Unlimited products',
      'Reviews & profit insights',
    ],
  },
  Enterprise: {
    key: 'Enterprise',
    name: 'Enterprise',
    priceMonthlyPkr: 12999,
    priceYearlyPkr: 129999,
    maxProducts: null,
    maxUsers: 10,
    features: {
      pos: true,
      invoices: true,
      stock: true,
      reports: true,
      reviews: true,
      profitInsights: true,
    },
    featureList: [
      'Everything in Premium',
      'Unlimited products',
      'Dedicated onboarding',
      'Custom duration',
      'Priority support',
    ],
  },
};

export function getPlan(packageName) {
  return SAAS_PLANS[packageName] || SAAS_PLANS.Basic;
}

export function listPlans({ publicOnly = false } = {}) {
  const plans = Object.values(SAAS_PLANS).map((p) => ({
    ...p,
    features: p.featureList,
    featureFlags: p.features,
    unlimitedProducts: p.maxProducts == null,
  }));
  if (publicOnly) {
    return plans.filter((p) => p.key !== 'Enterprise');
  }
  return plans;
}

export function planHasPos(packageName) {
  return Boolean(getPlan(packageName).features?.pos);
}

export function isProductLimitReached(count, maxProducts) {
  if (maxProducts == null) return false;
  return count >= maxProducts;
}

/** Public client origin for shop login links */
export function clientOrigin() {
  const raw = String(process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');
  return raw || 'http://localhost:5173';
}

export function shopLoginLink(username) {
  const u = encodeURIComponent(String(username || '').trim().toLowerCase());
  return `${clientOrigin()}/login?u=${u}`;
}

export function generateShopPassword() {
  const part = Math.random().toString(36).slice(2, 8);
  return `MsT${part}!9`;
}

export function slugify(text) {
  return (
    String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'shop'
  );
}

export async function uniqueSlug(ShopModel, base) {
  let slug = slugify(base);
  let i = 0;
  while (await ShopModel.findOne({ slug: i ? `${slug}-${i}` : slug })) {
    i += 1;
  }
  return i ? `${slug}-${i}` : slug;
}
