// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ACCESS_LEVEL_BY_ROLE = {
  'tenant-admin': 'Level 5',
  supervisor: 'Level 4',
  agent: 'Level 3',
  customer: 'Level 1',
  'ops-admin': 'Level 5',
  'knowledge-manager': 'Level 4',
  'ai-manager': 'Level 4',
  'channel-admin': 'Level 4',
  'compliance': 'Level 4',
  executive: 'Level 5',
};

export const generateEmployeeId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `EMP-${random}`;
};

export const resolveAccessLevel = role => ACCESS_LEVEL_BY_ROLE[role] || 'Level 1';

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    employeeId: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer Not To Say'] },
    profileImage: { type: String, trim: true },
    
    designation: { type: String, trim: true },
    departmentId: { type: String, trim: true },
    teamId: { type: String, trim: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'customer', trim: true },
    permissions: [{ type: String }],
    status: { type: String, enum: ['Active', 'Suspended', 'Inactive'], default: 'Active' },
    employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'], default: 'Full-Time' },
    joiningDate: { type: Date },
    
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    timezone: { type: String, trim: true },
    language: { type: String, trim: true },
    
    lastLogin: { type: Date },
    emailVerified: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    inviteStatus: { type: String, enum: ['Pending', 'Active', 'Accepted'], default: 'Active' },
    temporaryPasswordGenerated: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    passwordChangedAt: { type: Date },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Legacy fields maintained for backward compatibility (temporarily)
    orgName: { type: String, trim: true },
    department: { type: String, trim: true },
    bio: { type: String, trim: true },
    organizationRole: { type: String, trim: true },
    accessLevel: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyIndustry: { type: String, trim: true },
    companySize: { type: String, trim: true },
    companyDescription: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    supportEmail: { type: String, trim: true, lowercase: true },
    businessPhone: { type: String, trim: true },
    subscriptionPlan: { type: String, trim: true },
    tenantStatus: { type: String, trim: true, default: 'Active' },
    isActive: { type: Boolean, default: true },
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
