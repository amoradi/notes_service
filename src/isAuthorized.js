const crypto = require("crypto");
const db = require("./db");

const hostsWhitelist = ["localhost", "127.0.0.1", "aaronmoradi.com"];

// TODO: share this.
const hash = (input) => {
  return crypto.createHash("sha256").update(input).digest("hex");
};

// TODO: Instead of querying DB each time here,
// Lookup is authorized with in-memory map.
// sessions storage cache
async function isAuthorized(req, res, next) {
  try {
    const apiKey = req.header("X-API-KEY");
    const selectAuthor = {
      text: "SELECT * FROM authors WHERE api_key=$1",
      values: [hash(apiKey)],
    };
    const { rows } = await db.query(selectAuthor);
    const isValidHost = hostsWhitelist.includes(req.hostname);
    isValidApiKey = rows.length === 1;

    if (isValidApiKey && isValidHost) {
      next();
    } else {
      // TODO: identify violating pieces: api key or host or both. Pass a message.
      res.status(403).json({ error: "Invalid API key/host" });
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}

module.exports = isAuthorized;
