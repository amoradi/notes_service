const { Pool } = require('pg')

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: process.env.DB_MAX,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT
}

const pool = new Pool(config);

module.exports = {
  /*

    Convenience Method to run a query -- removes the risk of leaking a client.

    "If you don't need a transaction or you just need to run a single query,
    the pool has a convenience method to run a query on any available client
    in the pool. This is the preferred way to query with node-postgres
    if you can as it removes the risk of leaking a client."

    https://node-postgres.com/features/pooling

  */
  query: (query, callback) => {
    //const start = Date.now()
    return pool.query(query, (err, res) => {
      // const duration = Date.now() - start
      // console.log('executed query', { text, duration, rows: res.rowCount })
      callback(err, res);
    });
  }
}
