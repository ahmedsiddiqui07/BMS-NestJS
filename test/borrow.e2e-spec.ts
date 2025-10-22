import { INestApplication } from '@nestjs/common';
import { loginAs } from 'src/common/utils/test/auth.util';
import { createTestingApp } from 'src/common/utils/test/test.util';
import request from 'supertest';
import { App } from 'supertest/types';
describe('Borrow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let borrowRecordId: number;
  let userToken: string;
  const bookId = 1;
  beforeAll(async () => {
    app = await createTestingApp();
    const adminLogin = await loginAs(app, 'admin@gmail.com', 'Ahmed123$');
    const userLogin = await loginAs(app, 'user@gmail.com', 'Ahmed123$');
    adminToken = adminLogin.token;
    userToken = userLogin.token;
  });
  afterAll(async () => {
    await app.close();
  });
  it('POST /borrows/ → User can borrow a book', async () => {
    const response = await request(app.getHttpServer())
      .post(`/borrows/${bookId}`)
      .set('Authorization', `${userToken}`)
      .expect(201);

    expect(response.body.message).toBe('Book Borrowed Successfully');
    borrowRecordId = response.body.result.borrowedBook.id as number;
  });

  it('POST /borrows/:id → should fail without JWT', async () => {
    await request(app.getHttpServer()).post(`/borrows/${bookId}`).expect(401);
  });

  it('POST /borrows/:id → ADMIN should get 403', async () => {
    await request(app.getHttpServer())
      .post(`/borrows/${bookId}`)
      .set('Authorization', adminToken)
      .expect(403);
  });

  it('PATCH /borrows/:id/return → USER can return book', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/borrows/${bookId}/return`)
      .set('Authorization', userToken)
      .expect(200);

    expect(response.body.message).toContain('Book returned');
  });
  it('PATCH /borrows/:id/return → invalid record should return 404', async () => {
    await request(app.getHttpServer())
      .patch(`/borrows/999/return`)
      .set('Authorization', userToken)
      .expect(404);
  });

  it('GET /borrows/:id → should fetch borrow record', async () => {
    const response = await request(app.getHttpServer())
      .get(`/borrows/${borrowRecordId}`)
      .set('Authorization', `${userToken}`)
      .expect(200);

    expect(response.body.message).toBe('Borrow record fetched successfully');
  });
});
