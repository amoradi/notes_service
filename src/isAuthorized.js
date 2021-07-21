const hostsWhitelist = ['localhost', 'aaronmoradi.com'];

function isAuthorized(req, res, next) {
  const apiKey = req.header('X-API-KEY');

  // TODO: hash api_keys so that you can
  // re-hash these api_key requests, so 
  // that you can have a WHERE clause.
  const selectAllAuthors = {
    text: 'SELECT * FROM authors',
  };
  
  db.query(selectAllAuthors , (err, dbRes) => {
    let isValidApiKey = false;

    for (let i = 0, ii = dbRes.rows.length; i < ii; i++) {
      bcrypt.compare(apiKey, dbRes.rows[i].api_key /* hashed */, function(err, result) {
        if(err) {
          continue;
        } else if (result) {
          isValidApiKey = true;
          break;
        } 
      });
    }

    const isValidHost = hostsWhitelist.includes(req.hostname);

    if (isValidApiKey && isValidHost) {
      next();
    } else {
      // TODO: identify violating pieces: api key or host or both. Pass a message.
      res.status(403);
    }
  });
}

module.exports = isAuthorized;
