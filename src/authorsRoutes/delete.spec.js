require('dotenv').config();

const request = require('supertest');
const db = require('../db');
const { app, server } = require('../index');

let apiKey;

async function registerAuthor() {
  const res = await request(app)
    .post('/api/authors/register')
    .send({
      email: 'chargha@chargha.chargha',
      name: 'myNameIsChargha'
    });

  // SIDE EFFECT
  apiKey = res.body.apiKey;
}

afterEach(async () => {
  await request(app)
    .delete ('/api/authors')
    .set('X-API-KEY', apiKey);
});

afterAll(async () => {
  server.close(() => {
    db.end();
  });
});

describe('DELETE /authors', function () {
  test('happy path: deletes an author', async function() {
    await registerAuthor();

    const res = await request(app)
      .delete('/api/authors/')
      .set('X-API-KEY', apiKey);

    expect(res.statusCode).toBe(200);
  });

  test('sad path: unauthorized API key', async function() {
    await registerAuthor();

    const res = await request(app)
      .delete('/api/authors/')
      .set('X-API-KEY', 'BAD_KEY');

    expect(res.statusCode).toBe(403);
  });

  test('sad path: no API key', async function() {
    await registerAuthor();

    const res = await request(app)
      .delete('/api/authors/');

    expect(res.statusCode).toBe(500);
  });
});
