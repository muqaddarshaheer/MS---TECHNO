import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function vaultKey() {
  const secret = process.env.PASSWORD_VAULT_KEY || process.env.JWT_SECRET || 'dev-vault-key';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/** Encrypt plaintext shop password for Super Admin recovery */
export function encryptPassword(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, vaultKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`;
}

export function decryptPassword(payload) {
  if (!payload || typeof payload !== 'string') return null;
  const parts = payload.split('.');
  if (parts.length !== 3) return null;
  try {
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    const data = Buffer.from(dataB64, 'base64url');
    const decipher = crypto.createDecipheriv(ALGO, vaultKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
