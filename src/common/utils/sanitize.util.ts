export function sanitizeResponse<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'salt'];

  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (sensitiveKeys.includes(key)) {
        return '[REDACTED]';
      }
      return value;
    }),
  ) as T;
}
