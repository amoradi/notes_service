const express = require("express");
const crypto = require("crypto");
const Router = require('express-promise-router')

const isAuthorized = require("../isAuthorized");
const db = require("../db");

// TODO: Think about breaking this file into separate, per-route files
// annotations are long =(

/*
  
  For encoding from markdown to HTML and reverse.
  (If a FE is ever used with this service, this could come in handy.)

  use https://www.npmjs.com/package/showdown

*/

// Allows the use of async route handlers.
const router = new Router();

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256")
  .update(input)
  .digest("hex");
}

router.get("/notes", isAuthorized, async (req, res) => {
  try {
    const apiKey = req.header('X-API-KEY');
    const selectNotes = {
      text: 'SELECT * FROM notes LEFT JOIN authors on notes.author = authors.name WHERE authors.api_key=$1',
      values: [hash(apiKey)]
    };
    const { rows: notes } = await db.query(selectNotes);
    res.status(200).json({
      // NOTE: Only return Note type =), not full JOIN-ED type
      data: notes.map(({ author, content, idx }) => {
        return {
          author,
          content,
          idx
        }
      })
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
      data: notes.map(({ author, content, idx }) => {
        return {
          author,
          content,
          idx
        }
      })
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

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

// Update a note. PATCH the content only.
// NOTE: naive approach in affirming author can update said note resource
router.patch("/notes/:idx", isAuthorized, async (req, res) => {
  try {
    const { content } = req.body;
    const apiKey = req.header('X-API-KEY');
    const selectNotes = {
      text: 'SELECT * FROM notes LEFT JOIN authors on notes.author = authors.name WHERE authors.api_key=$1 AND notes.idx=$2',
      values: [hash(apiKey), req.params.idx]
    };
    const { rows: notes } = await db.query(selectNotes);

    if (notes.length !== 1) {
      res.status(500).json({ error: 'Note idx for author not found.' });
    }

    // Update the note via the content field.
    const updateNote = {
      text: 'UPDATE notes SET content = $1 WHERE idx = $2',
      values: [content, req.params.idx]
    };
    const result = await db.query(updateNote);

    res.status(200).json({
      data: [result.rows[0]]
    });
  } catch {
    res.status(500).json({ error: err.toString() });
  }
}); 

// Delete a note.
router.delete("/notes/:idx", isAuthorized, async (req, res) => {
  try {
    const apiKey = req.header('X-API-KEY');
    const deleteNotes = {
      text: 'DELETE FROM notes USING authors WHERE notes.author = authors.name AND authors.api_key=$1 AND notes.idx=$2',
      values: [hash(apiKey), req.params.idx]
    };

    const result = await db.query(deleteNotes);

    if (result.rowCount === 0) {
      res.status(500).json({ error: 'Note idx for author not found.' });
    }

    res.status(200).json({
      data: [result.rows[0]]
    });

  } catch {
    res.status(500).json({ error: err.toString() });
  }
}); 

module.exports = router;
