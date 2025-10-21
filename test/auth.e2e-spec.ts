import { INestApplication } from '@nestjs/common';
import { createTestingApp } from 'src/common/utils/test/test.util';
import request from 'supertest';
import { App } from 'supertest/types';
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  beforeAll(async () => {
    app = await createTestingApp();
  });
  afterAll(async () => {
    await app.close();
  });
  it('POST /auth/login → should login and return tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@gmail.com', password: 'Ahmed123$' });

    expect(response.body).toHaveProperty('message', 'Login Successful');
    expect(response.body.tokens).toBeDefined();
  });

  it('POST /auth/register → should register a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'New User', email: 'newUser@gmail.com', password: 'Ahmed123$' });

    expect(response.body).toHaveProperty('message', 'Login Successful');
    expect(response.body.tokens).toBeDefined();
    expect(response.body.tokens.accessToken).toBeDefined();
    expect(response.body.tokens.refreshToken).toBeDefined();
  });

  it('GET /auth/google → should redirect to Google', async () => {
    const response = await request(app.getHttpServer()).get('/auth/google').expect(302);

    expect(response.body).toBeDefined();
  });
});
