import mongoose from 'mongoose';

const tenantRequestSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    package: { type: String, enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' },
    durationMonths: { type: Number, default: 12 },
    message: { type: String, default: '' },
    preferredUsername: { type: String, default: '', trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    createdShop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  },
  { timestamps: true }
);

export const TenantRequest = mongoose.model('TenantRequest', tenantRequestSchema);
