import mongoose from 'mongoose';
import { getPlan } from '../config/plans.js';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    owner: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    package: { type: String, enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' },
    payment: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    paymentMethod: { type: String, default: 'Cash' },
    planStart: { type: Date, default: Date.now },
    durationMonths: { type: Number, default: 12, min: 1 },
    expiry: { type: Date, required: true },
    paymentDueDate: { type: Date, default: null },
    restrictOnPaymentOverdue: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'blocked', 'suspended'],
      default: 'active',
    },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '22:00' },
    invoiceSeq: { type: Number, default: 1000 },
    /** Multi-tenant SaaS flags */
    isTenant: { type: Boolean, default: true },
    maxProductsOverride: { type: Number, default: null },
  },
  { timestamps: true }
);

shopSchema.methods.getPlanLimits = function getPlanLimits() {
  const plan = getPlan(this.package);
  const maxProducts =
    this.maxProductsOverride != null ? this.maxProductsOverride : plan.maxProducts;
  return {
    ...plan,
    maxProducts,
    hasPos: Boolean(plan.features?.pos),
    unlimitedProducts: maxProducts == null,
  };
};

shopSchema.methods.isPaymentOverdue = function isPaymentOverdue() {
  if (this.payment === 'paid') return false;
  const due = this.paymentDueDate || this.planStart || this.createdAt;
  if (!due) return false;
  return startOfDay(new Date()) > startOfDay(new Date(due));
};

shopSchema.methods.isAccessAllowed = function isAccessAllowed() {
  if (this.status === 'blocked' || this.status === 'suspended') return false;
  if (new Date(this.expiry) < new Date()) return false;
  if (this.status === 'expired') return false;
  if (this.restrictOnPaymentOverdue && this.isPaymentOverdue()) return false;
  return this.status === 'active';
};

shopSchema.statics.computeExpiry = function computeExpiry(planStart, durationMonths) {
  const end = new Date(planStart);
  end.setMonth(end.getMonth() + Number(durationMonths || 12));
  return end;
};

shopSchema.statics.formatDuration = function formatDuration(planStart, expiry, durationMonths) {
  const start = new Date(planStart);
  const end = new Date(expiry);
  const days = Math.max(0, Math.round((end - start) / 86400000));
  const months = durationMonths || Math.max(1, Math.round(days / 30.44));
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years > 1 ? 's' : ''} (${days} days)`;
  }
  return `${months} month${months > 1 ? 's' : ''} (${days} days)`;
};

export const Shop = mongoose.model('Shop', shopSchema);
