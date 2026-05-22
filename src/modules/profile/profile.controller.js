import fs from 'fs';
import multer from 'multer';
import path from 'path';
import User from '../../models/User.js';
import AuditLog from '../../models/AuditLog.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const uploadDir = path.resolve('public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const uploadAvatarMiddleware = upload.single('avatar');

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    return res.json(ApiResponse.success('Profile fetched successfully', user));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      designation,
      department,
      bio,
      timezone,
      address,
      city,
      state,
      country,
      postalCode,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (designation !== undefined) user.designation = designation;
    if (department !== undefined) user.department = department;
    if (bio !== undefined) user.bio = bio;
    if (timezone !== undefined) user.timezone = timezone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (postalCode !== undefined) user.postalCode = postalCode;

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    } else if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }

    await user.save();

    // Log audit event
    try {
      await AuditLog.create({
        userId: user._id,
        action: 'PROFILE_UPDATED',
        details: { ip: req.ip }
      });
    } catch (auditErr) {
      console.error('Audit log failed:', auditErr);
    }

    return res.json(ApiResponse.success('Profile updated successfully', user.toJSON()));
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    if (!req.file) {
      return res.status(400).json(ApiResponse.error('Avatar file is required'));
    }

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    return res.json(
      ApiResponse.success('Profile image uploaded successfully', {
        profileImage: user.profileImage,
        user: user.toJSON(),
      })
    );
  } catch (error) {
    next(error);
  }
};
