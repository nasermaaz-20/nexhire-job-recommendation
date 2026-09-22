// Validation utility functions for NexHire

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  // Placeholder implementation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
export const validatePassword = (password) => {
  // Placeholder implementation
  // Minimum 8 characters
  return password && password.length >= 8;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const validateRequired = (value) => {
  // Placeholder implementation
  return value !== null && value !== undefined && value !== '';
};
