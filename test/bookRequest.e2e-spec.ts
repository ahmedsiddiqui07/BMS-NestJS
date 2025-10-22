import { INestApplication } from '@nestjs/common';
import { RequestStatus } from 'src/common/constants/enum/req-status.enum';
import { loginAs } from 'src/common/utils/test/auth.util';
import { createTestingApp } from 'src/common/utils/test/test.util';
import request from 'supertest';
import { App } from 'supertest/types';
describe('Book Reqeust (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  const bookRequestId = 1;

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

  it('PATCH /book-request/:id → USER can return book', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/book-request/${bookRequestId}`)
      .set('Authorization', `${adminToken}`)
      .send({ status: RequestStatus.APPROVED })
      .expect(200);

    expect(response.body.message).toBe('Book request updated successfully');
    expect(response.body.result.status).toBe(RequestStatus.APPROVED);
  });

  it('GET /book-request/:id → Admin can fetch borrow record', async () => {
    const response = await request(app.getHttpServer())
      .get(`/book-request/${bookRequestId}`)
      .set('Authorization', `${adminToken}`)
      .expect(200);

    expect(response.body.message).toBe('Book request fetched successfully');
    expect(response.body.result.id).toBe(bookRequestId);
  });

  it('GET /book-request/:id → should return 404 for invalid ID', async () => {
    await request(app.getHttpServer())
      .get(`/book-request/99999`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('GET /book-request/:id → USER should NOT access (403)', async () => {
    await request(app.getHttpServer())
      .get(`/book-request/${bookRequestId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
