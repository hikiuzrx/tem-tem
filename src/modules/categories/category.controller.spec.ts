/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Register and login as admin to get token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'admincat@example.com',
      username: 'admincat',
      password: 'AdminCat123',
      role: 'admin',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admincat@example.com',
        password: 'AdminCat123',
      });
    adminToken =
      loginRes.body.content?.token ||
      loginRes.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
  });

  afterAll(async () => {
    await app.close();
  });

  it('/categories (POST) - should create a category', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'TestCategory')
      .field('description', 'A test category')
      .attach('image', Buffer.from('test'), 'test.jpg');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.content).toHaveProperty('name', 'TestCategory');
  });

  it('/categories/all (GET) - should get all categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.content)).toBe(true);
  });

  // Add more tests for update, delete, and error cases as needed
});
