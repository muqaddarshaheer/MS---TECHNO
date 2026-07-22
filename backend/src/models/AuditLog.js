import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: '' },
    action: { type: String, required: true },
    entity: { type: String, default: '' },
    entityId: { type: String, default: '' },
    reason: { type: String, default: '' },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ shop: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
