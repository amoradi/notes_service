const request = require('supertest');
const express = require('express');

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
    .post('authors/register')
    .send({
      email: 'chargha@chargha.chargha',
      name: 'myNameIsChargha'
    });

  assert(res.statusCode, 200);
  assert(res.body.email, 'chargha@chargha.chargha');
  assert(res.body.name, 'myNameIsChargha');
  assert(typeof res.body.apiKey, 'string'); 

  // SIDE EFFECT
  apiKey = res.body.apiKey;
}

async function associateNotesToAuthor(apiKey) {
  const res = await request(app)
    .post('notes')
    .set('X-API-KEY', apiKey)
    .send({
      content: '# Title 1 chargha bargha',
      author: 'myNameIsChargha'
    });
}

beforeAll(async () => {
  await registerAuthor();
  await associateNotesToAuthor(apiKey);
});

// Cleanup: Remove author and associated notes purposed for these tests.
afterAll(() => {

});

describe('GET /notes', function() {
  it('responds with json', function(done) {
    request(app)
      .get('/notes')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
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
