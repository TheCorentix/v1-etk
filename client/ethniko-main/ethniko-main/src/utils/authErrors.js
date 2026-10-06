// Turns the errors thrown while logging in or registering (Firebase Auth errors, or errors
// from our own API) into short messages a customer can act on.

const GENERIC = 'Something went wrong. Please try again.';

// Firebase Auth error codes -> customer-facing messages
const FIREBASE_MESSAGES = {
  // Firebase's default "email enumeration protection" reports a wrong password and an
  // unknown email with this same code, so one message has to cover both cases.
  'auth/invalid-credential': 'Incorrect email or password. If you are new here, please create an account.',
  'auth/user-not-found': 'No account found with this email. Please create an account.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/user-disabled': 'This account has been disabled. Please contact us for help.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Could not connect. Please check your internet connection and try again.',
  'auth/email-already-in-use': 'An account with this email already exists. Please login instead.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/operation-not-allowed': 'Login with email is not available right now. Please contact us.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing. Please try again.',
};

// Firebase configuration problems the customer can't fix. Log them, show something calm.
const CONFIG_CODES = new Set(['auth/api-key-not-valid', 'auth/invalid-api-key', 'auth/app-not-authorized', 'auth/internal-error']);

const firebaseCode = (err) => {
  if (typeof err?.code === 'string' && err.code.startsWith('auth/')) return err.code;
  // Some wrappers only keep the code inside the message: "Firebase: Error (auth/xyz)."
  const match = typeof err?.message === 'string' && err.message.match(/auth\/[a-z0-9-]+/i);
  return match ? match[0].toLowerCase() : null;
};

/**
 * @param {unknown} err the error that was thrown
 * @returns {string} a message that is safe and useful to show the customer
 */
export function friendlyAuthError(err) {
  const code = firebaseCode(err);
  if (code) {
    if (FIREBASE_MESSAGES[code]) return FIREBASE_MESSAGES[code];
    // Match on the start: Firebase's real code is "auth/api-key-not-valid.-please-pass-a-valid-api-key."
    if ([...CONFIG_CODES].some((configCode) => code.startsWith(configCode))) {
      console.error('Firebase auth is misconfigured:', err);
      return 'Login is not available right now. Please try again later.';
    }
    return GENERIC;
  }

  // Errors from our own API arrive as { status, message, errors } (see api/api.js)
  if (typeof err?.status === 'number') {
    if (err.status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (err.status >= 500) return 'We are having trouble on our side. Please try again in a moment.';
    const detail = err.errors?.[0]?.message || err.message;
    if (err.status === 401 || err.status === 403) {
      return 'We could not verify your account. Please try logging in again.';
    }
    return typeof detail === 'string' && detail ? detail : GENERIC;
  }

  // The API wrapper reports "no response from server" without a status
  if (typeof err?.message === 'string' && /network error/i.test(err.message)) {
    return 'Could not connect. Please check your internet connection and try again.';
  }

  return GENERIC;
}

export default friendlyAuthError;
