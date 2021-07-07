function isAuthorized(req, res, next) {
  // if API key header exists in author table
  // && requesting host is whitelisted.
  // 
  // then next(), else return 403
  // error message for bad API key and bad host
}

module.exports = isAuthorized;
