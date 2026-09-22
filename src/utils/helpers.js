// Helper utility functions for NexHire

/**
 * Format a date string to a readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  // Placeholder implementation
  return new Date(date).toLocaleDateString();
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  // Placeholder implementation
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  // Placeholder implementation
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
