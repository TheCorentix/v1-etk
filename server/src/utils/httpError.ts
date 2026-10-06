/**
 * Creates an Error carrying an HTTP status code, which the global error middleware
 * uses for the response (it defaults to 500 otherwise).
 */
export const httpError = (statusCode: number, message: string): Error & { statusCode: number } =>
  Object.assign(new Error(message), { statusCode });

export default httpError;
