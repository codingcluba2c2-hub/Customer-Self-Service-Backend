// src/modules/auth/auth.service.js
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken.js';
import env from '../../config/env.js';
import jwt from 'jsonwebtoken';

// Store refresh tokens in DB (simple array storage for demo; in prod use a dedicated collection)
const refreshTokens = new Map(); // key: userId, value: token

export const registerUser = async ({ firstName, lastName, email, password, orgName, role = 'customer', phone, timezone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw { statusCode: 400, message: 'User already exists with this email' };
  }

  // Let Mongoose pre-save hook hash the password
  const user = new User({
    firstName: firstName?.trim(),
    lastName: lastName?.trim(),
    email,
    phone,
    password,
    role,
    orgName: orgName?.trim(),
    timezone,
  });
  await user.save();

  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  refreshTokens.set(user._id.toString(), refreshToken);

  return { user: user.toJSON(), accessToken, refreshToken };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }
  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  // Store refresh token
  refreshTokens.set(user._id.toString(), refreshToken);
  
  // Update lastLogin
  user.lastLogin = new Date();
  await user.save();

  return { user: user.toJSON(), accessToken, refreshToken };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return user;
};

export const logoutUser = async (userId) => {
  refreshTokens.delete(userId.toString());
  return true;
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET);
    const stored = refreshTokens.get(decoded.id);
    if (!stored || stored !== refreshToken) {
      throw new Error('Refresh token not recognized');
    }
    const newAccess = generateAccessToken({ id: decoded.id, role: decoded.role });
    return newAccess;
  } catch (err) {
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }
};
