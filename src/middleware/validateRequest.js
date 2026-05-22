// src/middleware/validateRequest.js
import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/ApiResponse.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = {};
    errors.array().forEach(err => {
      extractedErrors[err.path || err.param] = err.msg;
    });
    console.log('Validation errors:', extractedErrors);
    return res.status(400).json(ApiResponse.error('Validation failed', extractedErrors));
  }
  next();
};
