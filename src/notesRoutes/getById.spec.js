require('dotenv').config();

const request = require('supertest');
const db = require('../db');
const { app, server } = require('../index');

// assigned as a beforeEach side effect
let apiKey;
let notesIdx;

// Seed test data to DB: register an author, create a some note.
async function registerAuthor() {
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
}

async function associateNotesToAuthor(apiKey) {
  if (apiKey) {
    const res = await request(app)
      .post('/api/notes')
      .set('X-API-KEY', apiKey)
      .send({
        content: '# Title 1 chargha bargha',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);

    notesIdx = res.body.data[0].idx;
  }
}

beforeEach(async () => {
  await registerAuthor();
  await associateNotesToAuthor(apiKey);
});

afterEach(async () => {
  const res = await request(app)
    .delete ('/api/authors')
    .set('X-API-KEY', apiKey);
    
  expect(res.statusCode).toBe(200);
});

afterAll((done) => {
  server.close(() => {
    db.end();
    done();
  });
});

describe('GET /notes/:idx', function () {
  test('happy path: returns note', function(done) {
    request(app)
      .get('/api/notes/' + notesIdx)
      .set('Accept', 'application/json')
      .set('X-API-KEY', apiKey)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('myNameIsChargha');
        expect(res.body.data[0].content).toBe('# Title 1 chargha bargha');
    
        noteIdx = res.body.data[0].idx;

        return done();
      });
  });

  test('sad path: unauthorized API key', function(done) {
    request(app)
      .get('/api/notes/' + notesIdx)
      .set('Accept', 'application/json')
      .set('X-API-KEY', 'bad key')
      .expect('Content-Type', /json/)
      .expect(403)
      .end(function(err, res) {
        if (err) return done(err);

        return done();
      });
  });

  test('sad path: no API key', function(done) {
    request(app)
      .get('/api/notes/' + notesIdx)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);

        return done();
      });
  });
});
