/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let categoryId: string;
  let productId: string;

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
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'adminprod@example.com',
      username: 'adminprod',
      password: 'AdminProd123',
      role: 'admin',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'adminprod@example.com',
        password: 'AdminProd123',
      });
    adminToken =
      loginRes.body.content?.token ||
      loginRes.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];

    // Create a category for product
    const catRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'ProductCategory')
      .field('description', 'Category for products');
    categoryId = catRes.body.content?._id || catRes.body.content?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (POST) - should create a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'TestProduct')
      .field('description', 'A test product')
      .field('price', '99.99')
      .field('category', 'ProductCategory')
      .attach('image', Buffer.from('test'), 'test.jpg');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.content).toHaveProperty('name', 'TestProduct');
    productId = res.body.content?._id || res.body.content?.id;
  });

  it('/products (GET) - should get all products', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.content)).toBe(true);
  });

  it('/products/:id (GET) - should get product by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.content).toHaveProperty('name', 'TestProduct');
  });

  // Add more tests for update, delete, filter, and error cases as needed
});
