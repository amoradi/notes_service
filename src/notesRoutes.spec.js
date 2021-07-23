const request = require('supertest');
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

jest.setTimeout(16000);

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
  const res = await request(app)
    .post('/api/notes')
    .set('X-API-KEY', apiKey)
    .send({
      content: '# Title 1 chargha bargha',
    });
    
  expect(res.statusCode).toBe(200);

  console.log('associate notes to author was called $$$$')
}

beforeAll(async () => {
  const key = await registerAuthor();
  await associateNotesToAuthor(key);
});

// Cleanup: Remove author and associated notes purposed for these tests.
afterAll((done) => {
  server.close(done);
});

describe('GET /notes', function () {
  it('responds with json', async function(done) {
    request(app)
      .get('/api/notes')
      .set('Accept', 'application/json')
      .set('X-API-KEY', apiKey)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;

        expect(res.data.length).toBe(1);
        expect(res.data[0].name).toBe('myNameIsChargha');
        expect(res.data[0].content).toBe('# Title 1 chargha bargha');
        console.log('$$$$ GET NOTES RESPONSE >>>', res);
      });
  });

  // it returns all notes

  // 
});


//// COPIED

// const {assert} = require('chai');
// const request = require('supertest');
// const {jsdom} = require('jsdom');

// const app = require('../../app');

// const parseTextFromHTML = (htmlAsString, selector) => {
//     const selectedElement = jsdom(htmlAsString).querySelector(selector);
//     if (selectedElement !== null) {
//       return selectedElement.textContent;
//     } else {
//       throw new Error(`No element with selector ${selector} found in HTML string`);
//     }
// };

// describe('when the Message is valid', () => {
//     it('creates a new message', async () => {
//       const author = 'user name';
//       const message ='feature testing with TDD makes me feel empowered to create a better workflow';
      
//       //save message
//       const response = await request(app)
//         .post('/messages')
//         .type('form')
//         .send({author, message});
      
//       //check database to verify message is saved
//       assert.ok(await Message.findOne({message, author}), 'Creates a Message record');
//     });
// });
