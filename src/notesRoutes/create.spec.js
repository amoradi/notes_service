require("dotenv").config();

const request = require("supertest");
const db = require("../db");
const { app, server } = require("../index");

// assigned as a beforeEach side effect
let apiKey;

// Seed test data to DB: register an author, create a some note.
async function registerAuthor() {
  const res = await request(app).post("/api/authors/register").send({
    email: "chargha@chargha.chargha",
    name: "myNameIsChargha",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.email).toBe("chargha@chargha.chargha");
  expect(res.body.name).toBe("myNameIsChargha");
  expect(typeof res.body.apiKey).toBe("string");

  // SIDE EFFECT
  apiKey = res.body.apiKey;
}

beforeEach(async () => {
  await registerAuthor();
});

afterEach(async () => {
  const res = await request(app)
    .delete("/api/authors")
    .set("X-API-KEY", apiKey);

  expect(res.statusCode).toBe(200);
});

afterAll((done) => {
  server.close(() => {
    db.end();
    done();
  });
});

describe("POST /notes", function () {
  // From the note created in the test setup in beforeEach, return the single note.
  test("happy path: returns a note", async function () {
    const res = await request(app)
      .post("/api/notes")
      .set("Accept", "application/json")
      .set("X-API-KEY", apiKey)
      .send({ content: "# POST UP ## chargha bargha" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].author).toBe("myNameIsChargha");
    expect(res.body.data[0].content).toBe("# POST UP ## chargha bargha");
  });

  test("sad path: unauthorized API key", function (done) {
    request(app)
      .post("/api/notes")
      .set("Accept", "application/json")
      .set("X-API-KEY", "bad key")
      .send({ content: "# POST UP ## chargha bargha" })
      .expect("Content-Type", /json/)
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);

        return done();
      });
  });

  test("sad path: no API key", function (done) {
    request(app)
      .post("/api/notes")
      .set("Accept", "application/json")
      .send({ content: "# POST UP ## chargha bargha" })
      .expect("Content-Type", /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) return done(err);

        return done();
      });
  });
});
