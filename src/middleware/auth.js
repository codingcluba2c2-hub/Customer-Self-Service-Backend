// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json(ApiResponse.error('Not authorized, token missing'));
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json(ApiResponse.error('User not found'));
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json(ApiResponse.error('Not authorized, token invalid'));
  }
};
