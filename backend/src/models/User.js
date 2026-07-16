import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encryptPassword } from '../utils/passwordVault.js';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    /** AES vault of shop plaintext password for Super Admin reveal only */
    passwordVault: { type: String, default: null, select: false },
    role: { type: String, enum: ['super', 'shop'], required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const plain = this.password;
    if (this.role === 'shop' && plain && !String(plain).startsWith('$2')) {
      this.set('passwordVault', encryptPassword(plain));
    }
    // Avoid double-hashing if password was already hashed
    if (String(plain).startsWith('$2a$') || String(plain).startsWith('$2b$')) {
      return next();
    }
    this.password = await bcrypt.hash(plain, 12);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    username: this.username,
    role: this.role,
    shop: this.shop,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

userSchema.index({ shop: 1, role: 1 });

export const User = mongoose.model('User', userSchema);
