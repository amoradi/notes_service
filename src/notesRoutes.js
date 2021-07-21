const express = require("express");
const isAuthorized = require("../isAuthorized");
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


// POST /notes/ - create a note. Apply to api_key. 
router.post("/notes/", isAuthorized, (req, res) => {
  const { content } = req.body;

  const selectAuthor = {
    text: 'SELECT * FROM authors WHERE api_key=$1',
    values: [req.header('X-API-KEY')] // TODO: hash to lookup
  };

  db.query(selectAuthor, (err, dbRes) => {
    if (err) {
      dbRes.status(500).json({
        error: err.toString()
      });
    }

    const first = dbRes.rows[0];
    const createNote = {
      text: 'INSERT INTO notes (author, content) VALUES ($1, $2)',
      values: [first.author, content]
    };
    
    db.query(createNote, (err_, dbRes_) => {
      if (err_) {
        res.status(500).json({
          error: err_.toString()
        });
      }

      res.status(200).json({
        notes: dbRes_.rows
      });
    });
  });
});

module.exports = router;
