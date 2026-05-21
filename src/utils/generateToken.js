// src/utils/generateToken.js
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload) => {
  // Refresh token can have longer expiry, e.g., 30 days
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
};
