DROP TABLE IF EXISTS books ;

CREATE TABLE IF NOT EXISTS
books (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(256) NOT NULL ,
  author VARCHAR(256) NOT NULL ,
  isbn VARCHAR(256) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  description text NOT NULL
);
