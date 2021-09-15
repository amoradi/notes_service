require('dotenv').config();

const request = require('supertest');
const db = require('../db');
const { app, server } = require('../index');

let apiKey;

afterEach(async () => {
  const res = await request(app)
  .delete ('/api/authors')
  .set('X-API-KEY', apiKey);
  
  expect(res.statusCode).toBe(200);
});

afterAll(async () => {
  server.close(() => {
    db.end();
  });
});

describe('POST /authors/register', function () {
  test('happy path: registers an author', async function() {
    const res = await request(app)
      .post('/api/authors/register')
      .send({
        email: 'chargha@chargha.chargha',
        name: 'myNameIsChargha'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('chargha@chargha.chargha');
    expect(res.body.name).toBe('myNameIsChargha');
    expect(typeof res.body.apiKey).toBe('string');

    // SIDE EFFECT
    apiKey = res.body.apiKey;
  });

  test('sad path: user with email already registered', async function() {
    const res1 = await request(app)
      .post('/api/authors/register')
      .send({
        email: 'chargha@chargha.chargha',
        name: 'myNameIsChargha'
      });
    // SIDE EFFECT
    apiKey = res1.body.apiKey;

    const res = await request(app)
      .post('/api/authors/register')
      .send({
        email: 'chargha@chargha.chargha',
        name: 'myNameIsCharghaDorja'
      });

    expect(res.statusCode).toBe(500);
    expect(res.error).toMatchObject(new Map([['Error', 'cannot POST /api/authors/register (500)']]));
  });
});
