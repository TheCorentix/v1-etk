import toast from 'react-hot-toast';

/**
 * Standardized function to capture API error logs and display user-friendly toast alerts.
 * @param {Object} error Standardized error details returned from api.js response interceptor
 */
export const handleApiError = (error) => {
  // If the error object is not formatted, resolve defaults
  const status = error?.status;
  const message = error?.message || 'An unexpected error occurred.';
  const errors = error?.errors || [];

  console.error(`[API Error Log] Status: ${status} | Message: ${message}`, error);

  // 1. Check HTTP Status Codes
  switch (status) {
    case 401:
      // Session expiry notification is managed by AuthContext via custom event listener
      break;

    case 403:
      toast.error('Access Denied. You do not have permission to view this resource.');
      break;

    case 404:
      toast.error('The requested resource was not found on the boutique server.');
      break;

    case 422:
      // Handle Zod schema validation errors
      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(message);
      }
      break;

    case 429:
      toast.error('Too many requests. Please slow down and try again in a few minutes.');
      break;

    case 500:
    case 502:
    case 503:
      toast.error('Boutique server is experiencing temporary difficulties. Please try again later.');
      break;

    default:
      // Handle physical network disconnects or timeouts
      if (!status) {
        toast.error('Network disconnected. Please check your internet connection and try again.');
      } else {
        toast.error(message);
      }
      break;
  }

  return {
    status,
    message,
    errors,
  };
};

export default handleApiError;
