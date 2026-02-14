/**
 * Retry utility with exponential backoff
 * 
 * Implements retry logic for external service calls with:
 * - Exponential backoff between retries
 * - Configurable max retries
 * - Timeout support
 * - User-friendly error messages
 * 
 * Requirements: 1.2, 10.3
 */

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (1-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 10000) {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.timeout - Timeout per attempt in ms (default: 30000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise<any>} Result of the function
 * @throws {Error} Last error if all retries fail
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 30000,
    shouldRetry = () => true,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race between function execution and timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      
      // Success - return result
      return result;

    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, baseDelay, maxDelay);
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, maxRetries, delay, error);
      }

      console.warn(
        `Attempt ${attempt}/${maxRetries} failed: ${error.message}. ` +
        `Retrying in ${Math.round(delay)}ms...`
      );

      // Wait before next retry
      await sleep(delay);
    }
  }

  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Determine if an HTTP error should be retried
 * @param {Error} error - Error object
 * @returns {boolean} True if should retry
 */
export function shouldRetryHttpError(error) {
  // Don't retry client errors (4xx) except 408, 429
  if (error.status >= 400 && error.status < 500) {
    return error.status === 408 || error.status === 429;
  }

  // Retry server errors (5xx)
  if (error.status >= 500) {
    return true;
  }

  // Retry network errors
  if (error.message.includes('network') || 
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')) {
    return true;
  }

  // Don't retry by default
  return false;
}

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @param {string} context - Context of the error (e.g., 'loading health data')
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error, context = 'completing your request') {
  // Network errors
  if (error.message.includes('network') || 
      error.message.includes('Failed to fetch') ||
      error.message.includes('ECONNREFUSED')) {
    return `Unable to connect to the server while ${context}. Please check your internet connection and try again.`;
  }

  // Timeout errors
  if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    return `The request took too long while ${context}. Please try again.`;
  }

  // Rate limit errors
  if (error.status === 429 || error.message.includes('rate limit')) {
    return `Too many requests. Please wait a moment before trying again.`;
  }

  // Authentication errors
  if (error.status === 401 || error.message.includes('Unauthorized')) {
    return `Your session has expired. Please log in again.`;
  }

  // Permission errors
  if (error.status === 403 || error.message.includes('Forbidden')) {
    return `You don't have permission to perform this action.`;
  }

  // Not found errors
  if (error.status === 404) {
    return `The requested resource was not found.`;
  }

  // Server errors
  if (error.status >= 500) {
    return `The server encountered an error while ${context}. Please try again later.`;
  }

  // Validation errors
  if (error.status === 400 || error.message.includes('validation')) {
    return error.message || `Invalid data provided. Please check your input and try again.`;
  }

  // Generic error
  return `An error occurred while ${context}. Please try again.`;
}

/**
 * Wrap a fetch call with retry logic
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryOptions - Retry options
 * @returns {Promise<Response>} Fetch response
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options);
      
      // Check if response is ok
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      return response;
    },
    {
      ...retryOptions,
      shouldRetry: retryOptions.shouldRetry || shouldRetryHttpError
    }
  );
}

/**
 * Create a retry wrapper for API service methods
 * @param {Function} apiMethod - API method to wrap
 * @param {Object} retryOptions - Retry options
 * @returns {Function} Wrapped API method
 */
export function withRetry(apiMethod, retryOptions = {}) {
  return async function(...args) {
    try {
      return await retryWithBackoff(
        () => apiMethod.apply(this, args),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          shouldRetry: shouldRetryHttpError,
          onRetry: (attempt, maxRetries, delay, error) => {
            console.log(`Retrying API call (${attempt}/${maxRetries})...`);
          },
          ...retryOptions
        }
      );
    } catch (error) {
      // Add user-friendly message to error
      error.userMessage = getUserFriendlyErrorMessage(error, 'processing your request');
      throw error;
    }
  };
}

export default {
  retryWithBackoff,
  calculateBackoff,
  shouldRetryHttpError,
  getUserFriendlyErrorMessage,
  fetchWithRetry,
  withRetry
};
