/* 

  Holds all SQL statements needed to model the app,
  in case it's ever needed for later use.

  NOTE: varchar 100 & 10 used for consistency

  COOL: buildup JSON object 
  https://stackoverflow.com/questions/57332147/how-to-structure-nested-arrays-with-postgresql

*/

CREATE TABLE IF NOT EXISTS users (
  email varchar(100) NOT NULL UNIQUE,
  password varchar(100) NOT NULL,
  username varchar(100) NOT NULL PRIMARY KEY,
  created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ
);

/* 

  Tracks asset **ownership and amount owned** not price.
  Primary key denotes ownership -- in the form of a symbol-owner pair.

  - symbol, owner <PK>
  - owner <FK>

*/
CREATE TABLE IF NOT EXISTS holdings (
  symbol varchar(10) NOT NULL,
  name varchar(100) NOT NULL,
  category varchar(100)[] NOT NULL,
  amount decimal NOT NULL,
  owner varchar(100) NOT NULL REFERENCES users(username),
  PRIMARY KEY(symbol, owner)
);

/*

  Tracks price history for said asset. A Low-fi means of obtaining price data, vs 
  paying for a service. Data is polled from free API(s) and "made ours" by inserting
  it here.

  Asset price history is tracked based on ownership right now (holdings table). If a user
  owns an asset, its price should be tracked. If no users own an asset, it should be removed
  from this table.

*/

CREATE TYPE price_at_time AS (
  price numeric(15, 8),
  time TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS asset_price_history (
  symbol varchar(10) NOT NULL UNIQUE PRIMARY KEY,
  price_daily_in_usd price_at_time[] NOT NULL
  /* add other timestamps?? */
)

CREATE TABLE IF NOT EXISTS notes (
  author varchar(100) NOT NULL REFERENCES users(username) PRIMARY KEY,
  content text NOT NULL
);