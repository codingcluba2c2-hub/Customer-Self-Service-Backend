// src/models/Tenant.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    companyCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    industry: { type: String, trim: true },
    website: { type: String, trim: true },
    supportEmail: { type: String, trim: true, lowercase: true },
    supportPhone: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    subscriptionPlan: { type: String, trim: true, default: 'Enterprise' },
    licenseLimit: { type: Number, default: 100 },
    status: { type: String, enum: ['Active', 'Suspended', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.model('Tenant', tenantSchema);
