import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
export async function loginAs(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer()).post('/auth/login').send({ email, password });
  if (!res.body?.tokens?.accessToken) {
    throw new Error('Login failed: no access token returned from API');
  }

  return res.body.tokens.accessToken;
}
