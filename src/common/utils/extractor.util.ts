import { Request } from 'express';

export const customTokenExtractor = (request: Request): string | null => {
  if (!request || !request.headers) return null;

  const authHeader = request.headers['authorization'];
  if (!authHeader || typeof authHeader !== 'string') return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return authHeader.trim() || null;
};
