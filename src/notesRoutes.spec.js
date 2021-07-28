require('dotenv').config();

const request = require('supertest');
const db = require('./db');
const { app, server } = require('./index');

// THESE ARE REALLY INTEGRATION TESTS B/C WE INTERFACE WITH THE DB LAYER.

// import app
// const app = require('hahahah');

// GET /notes/ - get all notes via api_key

// GET /notes/:id - get a note via api_key and :id

// POST /notes/ - create notes. Apply to api_key. 

// PUT /notes/:id - update a note via api_key and :id

// DELETE /notes/:id - destroy a note via api_key and :id

/*

  NOTE: A downside with setting up and tearing down with actual DB data, is that,
  the prepare and post steps use endpoints, under this very test umbrella.
  
  Upside, if endpoints used in setup and teardown don't work properly tests will fail,
  though error could be obfiscated.

*/

// assigned in beforeAll's side effect
let apiKey;

// Seed test data to DB: register an author, create some notes.
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

beforeAll(async () => {
  const apiKey = await registerAuthor();
  await associateNotesToAuthor(apiKey);
});

// Cleanup: Remove author and associated notes purposed for these tests.
afterAll((done) => {
  // TODO: DELETE author and associates notes
  // then ... server close
  server.close(() => {
    db.end();
    done();
  });
});

describe('GET /notes', function () {
  it('responds with json', function(done) {
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
});
