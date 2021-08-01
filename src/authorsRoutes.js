const express = require("express");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");
const Router = require('express-promise-router')

const db = require("./db");
const isAuthorized = require("./isAuthorized");

// Allows you to use async functions as route handlers.
const router = new Router();

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256")
  .update(input)
  .digest("hex");
}

// WARNING REQUEST FIELDS ARE NOT SANTIZED YET.

router.post("/authors/register", async (req, res) => {
  try {
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
    const dbRes = await db.query(registerAuthor);

    if (dbRes && Array.isArray(dbRes.rows)) {
      // NOTE: dbRes.rows is empty, even on this happy-success path.
      res.status(200).json({
        apiKey, // Not hashed. This response will be the only time to access this.
        email,
        name,
      });
    } else {
      throw('Author not registered');
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// FUTURE: Reset api key endpoint, DELETE author. 

// TODO: delete N authors
router.delete("/authors/", isAuthorized,  async (req, res) => {
  try {
    const apiKey = req.header('X-API-KEY');
    const deleteAuthor = {
      text: 'DELETE FROM authors WHERE authors.api_key=$1',
      values: [hash(apiKey)]
    };
    const { rows: author } = await db.query(deleteAuthor);

    res.status(200).json({
      data: author
    });
  } catch(err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
