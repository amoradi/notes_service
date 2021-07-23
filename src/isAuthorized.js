const crypto = require("crypto");
const db = require("./db");

const hostsWhitelist = ['localhost', '127.0.0.1', 'aaronmoradi.com'];

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256")
  .update(input)
  .digest("hex");
}

// TODO: Instead of querying DB each time here, 
// Lookup is authorized with in-memory map.
function isAuthorized(req, res, next) {
  const apiKey = req.header('X-API-KEY');
  const selectAuthor = {
    text: 'SELECT * FROM authors WHERE api_key=$1',
    values: [hash(apiKey)]
  };
  console.log('is authorized was called...');

  db.query(selectAuthor, (err, dbRes) => {
    let isValidApiKey = false;
    const isValidHost = hostsWhitelist.includes(req.hostname);

    console.log('err %%', err);

    if (err) {
      res.status(500).json({
        error: err.toString()
      });
    } else {
      isValidApiKey = dbRes.rows.length === 1;
    }

    console.log('wtf', isValidApiKey, isValidHost, req.hostname)
    if (isValidApiKey && isValidHost) {
      next();
    } else {
      // TODO: identify violating pieces: api key or host or both. Pass a message.
      res.status(403);
    }
  });
}

module.exports = isAuthorized;
