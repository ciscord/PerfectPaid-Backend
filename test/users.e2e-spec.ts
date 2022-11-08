import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import axios from 'axios';

describe('Users (e2e)', () => {
  let app: INestApplication;
  const password = 'z65rgkra';
  const email = `${password}@getperfectpaid.com`;
  let accessToken;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('auth0 login', async () => {
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: 'password',
        username: email,
        password,
        scope: 'openid profile email',
        audience: process.env.AUTH0_AUDIENCE,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
      },
    );

    accessToken = response.data.access_token;
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        phone: '+14092767448',
        address1: '123 Astra Ave',
        address2: 'Apt 456',
        city: 'Palo Alto',
        state: 'CA',
        ssn: '9999',
        postalCode: '34254',
        dob: '1970-09-09',
      })
      .set('Accept', 'application/json')
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
