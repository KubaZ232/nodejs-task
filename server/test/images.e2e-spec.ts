import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { join } from 'path';
import { existsSync } from 'fs';

jest.setTimeout(30_000);

describe('Images e2e', () => {
  let app: INestApplication;
  let createdId: string;
  let createdUrl: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = process.env.DB_HOST || 'localhost';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'app';
    process.env.DB_PASS = process.env.DB_PASS || 'app';
    process.env.DB_NAME = process.env.DB_NAME || 'images';
    process.env.LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || './uploads';
    process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /images should upload & resize', async () => {
    const filePath = join(__dirname, 'fixtures', 'cat.jpg');
    expect(existsSync(filePath)).toBe(true); 

    const res = await request(app.getHttpServer())
      .post('/images')
      .field('title', 'e2e-cat')
      .field('width', '480')
      .field('height', '320')
      .attach(
        'file',
        join(__dirname, 'fixtures', 'cat.jpg'),
        { filename: 'cat.jpg', contentType: 'image/jpeg' }
      )      

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(typeof res.body.url).toBe('string');
    expect(res.body.url).toContain('/static/');
    expect(res.body.width).toBe(480);
    expect(res.body.height).toBe(320);

    createdId = res.body.id;
    createdUrl = res.body.url;

    const { pathname } = new URL(createdUrl);
    const uploadsDir = join(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? 'uploads');
    const relative = pathname.replace(/^\/static\//, '');
    const fsPath = join(uploadsDir, relative);
    expect(existsSync(fsPath)).toBe(true);

  });

  it('GET /images should list with pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/images')
      .query({ limit: 10, offset: 0, title: 'e2e' });

    expect(res.status).toBe(200);
    expect(typeof res.body.total).toBe('number');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);

    const first = res.body.items[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('url');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('width');
    expect(first).toHaveProperty('height');
  });

  it('GET /images/:id should return single image', async () => {
    const res = await request(app.getHttpServer()).get(`/images/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.title).toBe('e2e-cat');
    expect(res.body.url).toBe(createdUrl);
  });
});
