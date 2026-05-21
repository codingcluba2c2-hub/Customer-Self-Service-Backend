// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ACCESS_LEVEL_BY_ROLE = {
  'tenant-admin': 'Level 5',
  supervisor: 'Level 4',
  agent: 'Level 3',
  customer: 'Level 1',
};

export const generateEmployeeId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ADM-${random}`;
};

export const resolveAccessLevel = role => ACCESS_LEVEL_BY_ROLE[role] || 'Level 1';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer', trim: true },
    orgName: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    phone: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    timezone: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    bio: { type: String, trim: true },
    organizationRole: { type: String, trim: true },
    accessLevel: { type: String, trim: true },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    this.employeeId = generateEmployeeId();
  }

  if (!this.accessLevel) {
    this.accessLevel = resolveAccessLevel(this.role);
  }

  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);
