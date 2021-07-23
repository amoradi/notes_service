const express = require("express");
const isAuthorized = require("./isAuthorized");
const db = require("./db");

/*
  
  use https://www.npmjs.com/package/showdown

  var showdown  = require('showdown'),
      converter = new showdown.Converter(),
      text      = '# hello, markdown!',
      html      = converter.makeHtml(text);

  var showdown  = require('showdown'),
    converter = new showdown.Converter(),
    html      = '<a href="https://patreon.com/showdownjs">Please Support us!</a>',
    md        = converter.makeMarkdown(text);
     
*/

// TDD these.
//
// authorize permission
// via an API key, sent in a header

// create, get, update

const router = express.Router();

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256")
  .update(input)
  .digest("hex");
}

// POST /notes/ - create a note. Apply to api_key. 
router.post("/notes", isAuthorized, (req, res) => {
  console.log('POST NOTES WAS CALLED ')
  const { content } = req.body;
  const apiKey = req.header('X-API-KEY');

  // TODO: share this.
  const selectAuthor = {
    text: 'SELECT * FROM authors WHERE api_key=$1',
    values: [hash(apiKey)]
  };

  console.log('hash', hash(apiKey));

  db.query(selectAuthor, (err, dbRes) => {
    console.log('err', err);
    console.log('dbRes', dbRes);

    if (err) {
      dbRes.status(500).json({
        error: err.toString()
      });
    }

    if (dbRes.rows.length !== 1) {
      dbRes.status(500).json({
        error: `${dbRes.rows.length} authors found for note.`
      });
    }

    const author = dbRes.rows[0];
    const createNote = {
      text: 'INSERT INTO notes (author, content) VALUES ($1, $2)',
      values: [author.name, content]
    };
    
    db.query(createNote, (err_, dbRes_) => {
      if (err_) {
        res.status(500).json({
          error: err_.toString()
        });
      }

      res.status(200).json({
        data: dbRes_.rows
      });
    });
  });
});

module.exports = router;
