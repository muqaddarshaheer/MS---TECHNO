/** MS Techno multi-tenant SaaS plan catalog */
export const SAAS_PLANS = {
  Basic: {
    key: 'Basic',
    name: 'Basic',
    priceMonthlyPkr: 2999,
    priceYearlyPkr: 29999,
    maxProducts: 100,
    maxUsers: 1,
    features: [
      'POS & invoices',
      'Stock management',
      'Customers & expenses',
      'Daily / monthly reports',
      '1 shop login',
    ],
  },
  Premium: {
    key: 'Premium',
    name: 'Premium',
    priceMonthlyPkr: 5999,
    priceYearlyPkr: 59999,
    maxProducts: 500,
    maxUsers: 3,
    features: [
      'Everything in Basic',
      'Up to 500 products',
      'Reviews & profit insights',
      'Priority announcements',
      'Multi-month plans',
    ],
  },
  Enterprise: {
    key: 'Enterprise',
    name: 'Enterprise',
    priceMonthlyPkr: 12999,
    priceYearlyPkr: 129999,
    maxProducts: 5000,
    maxUsers: 10,
    features: [
      'Everything in Premium',
      'Up to 5000 products',
      'Dedicated onboarding',
      'Custom duration',
      'Priority support',
    ],
  },
};

export function getPlan(packageName) {
  return SAAS_PLANS[packageName] || SAAS_PLANS.Basic;
}

export function listPlans() {
  return Object.values(SAAS_PLANS);
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'shop';
}

export async function uniqueSlug(ShopModel, base) {
  let slug = slugify(base);
  let i = 0;
  while (await ShopModel.findOne({ slug: i ? `${slug}-${i}` : slug })) {
    i += 1;
  }
  return i ? `${slug}-${i}` : slug;
}
