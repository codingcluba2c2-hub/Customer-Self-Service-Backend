// src/config/db.js
import mongoose from 'mongoose';
import User, { generateEmployeeId, resolveAccessLevel } from '../models/User.js';
import env from './env.js';

const redactMongoUri = uri => {
  if (!uri) return uri;
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/i, '$1$2:***@');
};

const migrateExistingUsers = async () => {
  const users = await User.find({
    $or: [
      { employeeId: { $exists: false } },
      { employeeId: null },
      { employeeId: '' },
      { accessLevel: { $exists: false } },
      { accessLevel: null },
      { accessLevel: '' },
    ],
  });

  for (const user of users) {
    if (!user.employeeId) {
      user.employeeId = generateEmployeeId();
    }

    if (!user.accessLevel) {
      user.accessLevel = resolveAccessLevel(user.role);
    }

    await user.save();
  }
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  console.log('Attempting MongoDB connection to:', redactMongoUri(env.MONGO_URI));

  if (!env.MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    throw new Error('MONGO_URI missing');
  }

  try {
    const db = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    isConnected = db.connections[0].readyState === 1;

    await migrateExistingUsers();
    console.log('MongoDB connected');
  } catch (error) {
    if (error?.code === 'ECONNREFUSED' && error?.syscall === 'querySrv') {
      console.error(
        'MongoDB SRV lookup failed. Verify that the Atlas cluster hostname in MONGO_URI is correct and copied exactly from Atlas.'
      );
    }

    console.error('MongoDB connection error:', error);
    // process.exit(1) should not be used in serverless environments
    throw error;
  }
};

export default connectDB;
