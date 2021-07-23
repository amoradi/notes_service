const express = require("express");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");
const db = require("./db");

const router = express.Router();

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256")
  .update(input)
  .digest("hex");
}

// WARNING REQUEST FIELDS ARE NOT SANTIZED YET.

router.post("/authors/register", (req, res) => {
  const { email, name } = req.body;
  // Generate a random key.
  // This is sent back to the requester upon success.
  // And is the ONLY time to read it.
  const apiKey = uuidv4();
   // hash the api key for storage.
  const hashedApiKey = hash(apiKey);
  const registerAuthor = {
    text: 'INSERT INTO authors (email, name, api_key) VALUES ($1, $2, $3)',
    values: [email, name, hashedApiKey]
  };

  db.query(registerAuthor, (err, dbRes) => {
    if (err) {
      res.status(500).json({
        error: err.toString()
      });
    }

    // NOTE: dbRes.rows is empty, even on this happy-success path.
    res.status(200).json({
      apiKey, // Not hashed. This response will be the only time to access this.
      email,
      name,
    });
  });
});


// FUTURE: Reset api key endpoint, DELETE author. 

module.exports = router;
