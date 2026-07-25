import rateLimit from 'express-rate-limit';

// In development the SPA (especially the admin dashboard) fires many requests per
// page load, and HMR reloads multiply that — so rate limiting is skipped locally
// and kept strict in production.
const isDev = (process.env.NODE_ENV || 'development') !== 'production';

// Standard rate limiter for general application API routes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: isDev ? 100000 : 100, // Limit each IP per window (relaxed in dev)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => isDev, // Bypass entirely during local development
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    errors: ['Rate Limit Exceeded'],
  },
});

// Stricter rate limiter for authentication/login/register credentials endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: isDev ? 1000 : 15, // Limit each IP per window (relaxed in dev)
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Bypass entirely during local development
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: ['Brute Force Prevention Limit Exceeded'],
  },
});

export default apiRateLimiter;
