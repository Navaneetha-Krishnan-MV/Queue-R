const { body, validationResult } = require('express-validator');

// Validation middleware for question upload
const validateQuestionUpload = [
  // Check if questions array exists and is not empty
  body('questions')
    .exists().withMessage('Questions array is required')
    .isArray({ min: 1 }).withMessage('At least one question is required'),
  
  // Validate each question in the array
  body('questions.*.questionId')
    .exists().withMessage('Question ID is required')
    .isString().withMessage('Question ID must be a string'),
    
  body('questions.*.questionText')
    .exists().withMessage('Question text is required')
    .isString().withMessage('Question text must be a string')
    .trim().notEmpty().withMessage('Question text cannot be empty'),
    
  // Optional: Add more validations for other question fields as needed
  
  // Custom middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateQuestionUpload
};
