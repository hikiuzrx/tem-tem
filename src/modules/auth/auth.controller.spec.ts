/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a new user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'TestPass123',
    });
    expect(res.status).toBe(201);

    expect(res.body.success).toBe(true);

    expect(res.body.content).toHaveProperty('email', 'testuser@example.com');
  });

  it('/auth/login (POST) - should login user', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'testlogin@example.com',
      username: 'testlogin',
      password: 'TestPass123',
    });

    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'testlogin@example.com',
      password: 'TestPass123',
    });
    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
    expect(res.body.content).toHaveProperty('email', 'testlogin@example.com');
  });

  it('/auth/request-password-reset (POST) - should request password reset', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'resetuser@example.com',
      username: 'resetuser',
      password: 'TestPass123',
    });
    const res = await request(app.getHttpServer())
      .post('/auth/request-password-reset')
      .send({ email: 'resetuser@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('code');
  });

  // Add more tests for confirm-password-reset, logout, and error cases as needed
});
