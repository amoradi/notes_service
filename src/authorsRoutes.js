const express = require("express");
const { v4: uuidv4 } = require('uuid');
const db = require("./db");

const saltRounds = 10;
const router = express.Router();

// WARNING REQUEST FIELDS ARE NOT SANTIZED YET.

router.post("/authors/register", (req, res) => {
  const { email, name } = req.body;
  // Generate a random key.
  // This is sent back to the requester upon success.
  const apiKey = uuidv4();

  // Salt and hash the api key for storage.
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(apiKey, salt, function(err, hash) {
      const registerAuthor = {
        text: 'INSERT INTO authors (email, name, api_key) VALUES ($1, $2, $3)',
        values: [email, name, hash]
      };

      db.query(registerAuthor , (err, dbRes) => {
        if (err) {
          res.status(500).json({
            error: err.toString()
          });
        }

        res.status(200).json({
          apikey, // Not hashed. This response will be the only time to access this.
          email: dbRes.email,
          name: dbRes.name,
        });
      });
    });
  });
});

// FUTURE: Reset api key endpoint, DELETE author. 

module.exports = router;
