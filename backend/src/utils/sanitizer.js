/**
 * Data Sanitization Utilities
 * 
 * Provides functions for cleaning and sanitizing data to prevent security
 * vulnerabilities and accidental logging of sensitive information.
 */

/**
 * Recursively sanitizes an object by removing or masking sensitive fields.
 * 
 * @param {object} obj The object to sanitize.
 * @returns {object} A sanitized copy of the object.
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      
      if (lowerKey.includes('apikey') || lowerKey.includes('secret') || lowerKey.includes('password') || lowerKey.includes('token')) {
        sanitized[key] = '***hidden***';
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }

  return sanitized;
}

module.exports = {
  sanitizeObject,
};
