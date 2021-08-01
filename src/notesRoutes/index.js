const express = require("express");
const crypto = require("crypto");
const Router = require('express-promise-router')

const isAuthorized = require("../isAuthorized");
const db = require("../db");

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

// Allows the use of async route handlers.
const router = new Router();

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256")
  .update(input)
  .digest("hex");
}

// POST /notes/ - create a note. Apply to api_key. 
// TODO: create multiple notes
router.post("/notes", isAuthorized, async (req, res) => { 
  try {
    const { content } = req.body;
    const apiKey = req.header('X-API-KEY');
    // TODO: share this.
    const selectAuthor = {
      text: 'SELECT * FROM authors WHERE api_key=$1',
      values: [hash(apiKey)]
    };
    const { rows } = await db.query(selectAuthor);

    if (rows.length !== 1) {
      throw(`${rows.length} authors found for note.`);
    }

    const author = rows[0];
    const createNote = {
      text: 'INSERT INTO notes (author, content) VALUES ($1, $2) RETURNING *',
      values: [author.name, content]
    };
    const { rows: notes } = await db.query(createNote);

    res.status(200).json({
      data: [notes[0]] // Eventhough it's just one, maintain a returned array interface
    });
  } catch(err) {
    res.status(500).json({ error: err.toString() });
  }
});

router.get("/notes", isAuthorized, async (req, res) => {
  try {
    const apiKey = req.header('X-API-KEY');
    const selectNotes = {
      text: 'SELECT * FROM notes LEFT JOIN authors on notes.author = authors.name WHERE authors.api_key=$1',
      values: [hash(apiKey)]
    };
    const { rows: notes } = await db.query(selectNotes);
    res.status(200).json({
      data: notes
    });
  } catch(err) {
    res.status(500).json({ error: err.toString() });
  }
});

router.get("/notes/:idx", isAuthorized, async (req, res) => {
  try {
    const apiKey = req.header('X-API-KEY');
    const selectNotes = {
      text: 'SELECT * FROM notes LEFT JOIN authors on notes.author = authors.name WHERE authors.api_key=$1 AND notes.idx=$2',
      values: [hash(apiKey), req.params.idx]
    };
    const { rows: notes } = await db.query(selectNotes);
    
    res.status(200).json({
      data: notes
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
