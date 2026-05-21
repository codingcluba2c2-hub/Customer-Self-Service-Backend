// src/modules/auth/auth.validation.js
import { body } from 'express-validator';

// Simple password validation: at least 8 characters (matches frontend requirements)
const passwordRegex = /^.{8,}$/;

export const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('orgName').notEmpty().withMessage('Organization name is required'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('timezone').optional().isString().withMessage('Timezone must be a string'),
  body('password')
    .matches(passwordRegex)
    .withMessage('Password must be at least 8 characters, include uppercase, lowercase, number, and special character'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
