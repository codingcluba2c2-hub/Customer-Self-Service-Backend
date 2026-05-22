import { body } from 'express-validator';

export const updateProfileValidation = [
  body('firstName')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('bio')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  ...[
    'designation',
    'department',
    'timezone',
    'address',
    'city',
    'state',
    'country',
    'postalCode',
    'language',
    'companyWebsite',
    'companyIndustry',
    'companySize',
    'companyDescription',
    'linkedinUrl',
    'supportEmail',
    'businessPhone'
  ].map(field => 
    body(field)
      .optional({ checkFalsy: true })
      .isString()
      .trim()
  )
];
