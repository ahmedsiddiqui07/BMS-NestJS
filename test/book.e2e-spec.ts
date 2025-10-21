import { INestApplication } from '@nestjs/common';
import { loginAs } from 'src/common/utils/test/auth.util';
import { createTestingApp } from 'src/common/utils/test/test.util';
import request from 'supertest';
import { App } from 'supertest/types';
describe('Books (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let librarianToken: string;
  let userToken: string;
  let createdBookId: number;
  beforeAll(async () => {
    app = await createTestingApp();
    const adminLogin = await loginAs(app, 'admin@gmail.com', 'Ahmed123$');
    const librarianLogin = await loginAs(app, 'librarian@gmail.com', 'Ahmed123$');
    const userLogin = await loginAs(app, 'user@gmail.com', 'Ahmed123$');
    adminToken = adminLogin.token;
    librarianToken = librarianLogin.token;
    userToken = userLogin.token;
  });
  afterAll(async () => {
    await app.close();
  });
  it('Admin should create a book', async () => {
    const res = await request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `${adminToken}`)
      .send({ title: 'New Book', author: 'John', stock: 5 });

    expect(res.status).toBe(201);
    createdBookId = res.body.book.id as number;
  });

  it('User should NOT create a book', async () => {
    const res = await request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `${userToken}`)
      .send({ title: 'Should Fail', author: 'X', stock: 1 });

    expect(res.status).toBe(403);
  });

  it('Librarian should update only stock or availability', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/books/${createdBookId}`)
      .set('Authorization', `${librarianToken}`)
      .send({ stock: 10 });

    expect(res.status).toBe(200);
  });

  it('Librarian should NOT update title/author', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/books/${createdBookId}`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: 'Should Fail' });

    expect(res.status).toBe(403);
  });

  it('Should fetch book by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/books/${createdBookId}`)
      .set('Authorization', `${adminToken}`);

    expect(res.status).toBe(200);
  });
});
