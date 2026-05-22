// src/modules/auth/auth.controller.js
import { ApiResponse } from '../../utils/ApiResponse.js';
import { registerUser, loginUser, getCurrentUser, logoutUser, refreshAccessToken, changePassword } from './auth.service.js';
import env from '../../config/env.js';

// Register controller
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, orgName, role, phone, timezone } = req.body;
    const { user, accessToken, refreshToken } = await registerUser({ firstName, lastName, email, password, orgName, role, phone, timezone });
    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    // Set accessToken in cookie for robust persistence across reloads
    res.cookie('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json(ApiResponse.success('Registration successful', { token: accessToken, user }));
  } catch (err) {
    next(err);
  }

};

// Login controller
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser(email, password);
    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    // Set accessToken in cookie for robust persistence across reloads
    res.cookie('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Return access token in body and user data
    return res.json(ApiResponse.success('Login successful', { token: accessToken, user }));
  } catch (err) {
    next(err);
  }
};

// Get current user controller
export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    return res.json(ApiResponse.success('User fetched', user));
  } catch (err) {
    next(err);
  }
};

// Logout controller
export const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user.id);
    // Clear cookies
    res.clearCookie('refreshToken');
    return res.json(ApiResponse.success('Logged out'));
  } catch (err) {
    next(err);
  }
};

// Refresh token controller
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: tokenFromCookie } = req.cookies;
    if (!tokenFromCookie) {
      return res.status(401).json(ApiResponse.error('Refresh token missing'));
    }
    const newAccess = await refreshAccessToken(tokenFromCookie);
    return res.json(ApiResponse.success('Access token refreshed', { token: newAccess }));
  } catch (err) {
    next(err);
  }
};

// Change password controller
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await changePassword(req.user.id, oldPassword, newPassword);
    return res.json(ApiResponse.success('Password changed successfully', user));
  } catch (err) {
    next(err);
  }
};

// Health check controller
export const healthCheck = (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
};
