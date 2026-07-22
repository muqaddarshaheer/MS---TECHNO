import { AuditLog } from '../models/AuditLog.js';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export async function writeAudit({
  shopId,
  user,
  action,
  entity = '',
  entityId = '',
  reason = '',
  before = null,
  after = null,
}) {
  try {
    await AuditLog.create({
      shop: shopId,
      user: user?._id || null,
      username: user?.username || user?.displayName || '',
      action,
      entity,
      entityId: entityId ? String(entityId) : '',
      reason: reason || '',
      before,
      after,
      date: todayStr(),
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}
