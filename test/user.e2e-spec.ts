import { INestApplication } from '@nestjs/common';
import { loginAs } from 'src/common/utils/test/auth.util';
import { createTestingApp } from 'src/common/utils/test/test.util';
import request from 'supertest';
import { App } from 'supertest/types';
describe('User (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let adminUserId: number;
  let userToken: string;
  let normalUserId: number;
  beforeAll(async () => {
    app = await createTestingApp();
    const adminLogin = await loginAs(app, 'admin@gmail.com', 'Ahmed123$');
    adminToken = adminLogin.token;
    adminUserId = adminLogin.id;
    const userLogin = await loginAs(app, 'newUser@gmail.com', 'Ahmed123$');
    userToken = userLogin.token;
    normalUserId = userLogin.id;
  });
  afterAll(async () => {
    await app.close();
  });

  it('PATCH /users/ → USER can update own profile', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/`)
      .set('Authorization', `${userToken}`)
      .send({ name: 'Updated User Name' })
      .expect(200);

    expect(response.body.message).toBe('Profile updated Successfully');
  });

  it('GET /users/:id → ADMIN can fetch any user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${normalUserId}`)
      .set('Authorization', `${adminToken}`)
      .expect(200);

    expect(response.body.message).toBe('User fetched successfully');
  });

  it('DELETE /users/:id → should fail without JWT', async () => {
    await request(app.getHttpServer()).delete(`/users/${normalUserId}`).expect(401);
  });

  it('DELETE /users/:id → USER should get 403', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${normalUserId}`)
      .set('Authorization', `${userToken}`)
      .expect(403);
  });
  it('DELETE /users/:id → ADMIN deleting own account should return 400', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/${adminUserId}`)
      .set('Authorization', `${adminToken}`)
      .expect(400);

    expect(response.body.message).toBe('You cannot delete your own account');
  });

  it('DELETE /users/:id → ADMIN deleting User should return 200', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/${normalUserId}`)
      .set('Authorization', `${adminToken}`)
      .expect(200);

    expect(response.body.message).toBe('Account Deleted Successfully');
  });
});
