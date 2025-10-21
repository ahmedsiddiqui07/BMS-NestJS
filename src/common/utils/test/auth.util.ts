import { INestApplication } from '@nestjs/common';
import { AuthUtilResponse } from 'src/common/types/interface';
import request from 'supertest';
import { App } from 'supertest/types';
export async function loginAs(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<AuthUtilResponse> {
  const res = await request(app.getHttpServer()).post('/auth/login').send({ email, password });
  if (!res.body?.tokens?.accessToken) {
    throw new Error('Login failed: no access token returned from API');
  }

  return {
    token: res.body.tokens.accessToken as string,
    id: res.body.user.id as number,
  };
}
