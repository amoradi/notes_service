require('dotenv').config();

const request = require('supertest');
const db = require('../db');
const { app, server } = require('../index');

/*

  NOTE: A downside with setting up and tearing down with actual DB data, is that,
  the prepare and post steps use endpoints, under this very test umbrella.
  
  Upside, if endpoints used in setup and teardown don't work properly tests will fail,
  though error could be obfiscated.

*/

// assigned as a beforeEach side effect
let apiKey;

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

  return apiKey;
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

describe('GET /notes', function () {
  // From the note created in the test setup in beforeEach, return the single note.
  test('happy path: returns a note', function(done) {
    request(app)
      .get('/api/notes')
      .set('Accept', 'application/json')
      .set('X-API-KEY', apiKey)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('myNameIsChargha');
        expect(res.body.data[0].content).toBe('# Title 1 chargha bargha');
    
        return done();
      });
  });

  // Create a second note, and test if all notes are returned.
  test('happy path: returns all notes', async function() {
    await request(app)
      .post('/api/notes')
      .set('X-API-KEY', apiKey)
      .send({
        content: '# Title 2 chargha bargha',
      });

    const res = await request(app)
      .get('/api/notes')
      .set('Accept', 'application/json')
      .set('X-API-KEY', apiKey)
      .expect('Content-Type', /json/)
      .expect(200);
      
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].name).toBe('myNameIsChargha');
    expect(res.body.data[0].content).toBe('# Title 1 chargha bargha');
    expect(res.body.data[1].name).toBe('myNameIsChargha');
    expect(res.body.data[1].content).toBe('# Title 2 chargha bargha');
  });

  test('sad path: unauthorized API key', function(done) {
    request(app)
      .get('/api/notes')
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
      .get('/api/notes')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);

        return done();
      });
  });
});
