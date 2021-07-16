const express = require("express");
const db = require("./db");

const saltRounds = 10;
const router = express.Router();

router.post("/authors/register", (req, res) => {
  const { email, name } = req.body;
  // TODO: Generate a random key.
  // Maybe bcrypt has something for this.
  const apiKey = '';

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
          apikey, // Not hashed. This response will be the last time to access this.
          email: dbRes.email,
          name: dbRes.name,
        });
      });
    });
  });
});

module.exports = router;
