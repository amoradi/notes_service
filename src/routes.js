const express = require("express");
const isAuthorized = require("../isAuthorized");
const db = require("./db");

// authorize permission
// via an API key, sent in a header

// create, get all, write, update

const router = express.Router();

router.get("/notes/", isAuthorized, (req, res) => {
  // db.query(db.getNotes(api_key_header here), (err, dbRes) => {
  //   if (err) {
  //
  //   }

  //   res.status(200).json({
  //     notes: dbRes.rows
  //   });
  // });
});

module.exports = router;