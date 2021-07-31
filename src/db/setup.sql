/* 

  Holds all SQL statements needed to model the app,
  in case it's ever needed for later use.

  NOTE: varchar 100 used for consistency

*/

CREATE TABLE IF NOT EXISTS authors (
  email varchar(100) NOT NULL UNIQUE,
  name varchar(100) NOT NULL PRIMARY KEY,
  api_key varchar(100) NOT NULL /* hashed and salted */
);

CREATE TABLE IF NOT EXISTS notes (
  author varchar(100) NOT NULL REFERENCES author(name) ON DELETE CASCADE ON UPDATE CASCADE,
  content text NOT NULL, /* markdown / html */
  idx SERIAL
);
 